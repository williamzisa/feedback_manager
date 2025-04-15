"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "./database.types"

export async function getServerSupabase() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export async function getCurrentUser() {
  try {
    const supabase = await getServerSupabase()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Sessione non valida - effettua nuovamente il login")
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error("Errore auth.getUser:", authError)
      throw new Error("Errore di autenticazione - effettua nuovamente il login")
    }
    if (!user) {
      throw new Error("Utente non autenticato - effettua il login")
    }

    const { data: checkData, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)

    if (checkError) {
      console.error("Errore nella query di controllo:", checkError)
      throw new Error(`Errore nel controllo utente: ${checkError.message}`)
    }

    if (!checkData || checkData.length === 0) {
      throw new Error("Utente non trovato nel database")
    }

    if (checkData.length > 1) {
      console.error("Errore di integrità:", checkData)
      throw new Error("Errore di integrità: trovati multipli utenti con lo stesso auth_id")
    }

    const userData = checkData[0]

    if (!userData.company) {
      throw new Error("Company non configurata per questo utente")
    }

    return userData
  } catch (err) {
    console.error("Errore getCurrentUser:", err)
    throw err
  }
}

export async function getUserTeams(userId: string) {
  try {
    const supabase = await getServerSupabase()
    
    const { data, error } = await supabase
      .from("user_teams")
      .select(`
        id,
        team:teams (
          id,
          name,
          project,
          leader:users!teams_leader_fkey (
            id,
            name,
            surname
          ),
          team_clusters (
            id,
            cluster:clusters (
              id,
              name
            )
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Errore nel recupero dei team dell'utente:", error)
      throw error
    }

    if (!data) {
      return []
    }

    return data
      .filter((userTeam): userTeam is typeof userTeam & { team: NonNullable<typeof userTeam.team> } => 
        userTeam.team !== null
      )
      .map((userTeam) => ({
        id: userTeam.team.id,
        name: userTeam.team.name,
        is_project: userTeam.team.project || false,
        leader: userTeam.team.leader,
        clusters: userTeam.team.team_clusters
          ?.filter((tc): tc is typeof tc & { cluster: NonNullable<typeof tc.cluster> } => 
            tc.cluster !== null
          )
          .map((tc) => ({
            id: tc.cluster.id,
            name: tc.cluster.name
          })) || []
      }))
  } catch (err) {
    console.error("Errore nel recupero dei team dell'utente:", err)
    throw err
  }
}

export async function getTeamDetails(teamId: string, userId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Verifica che l'utente sia membro del team
    const { data: membership, error: membershipError } = await supabase
      .from("user_teams")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single()

    if (membershipError || !membership) {
      return null
    }

    // Recupera i dettagli del team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        project,
        leader:users!teams_leader_fkey (
          id,
          name,
          surname
        ),
        team_clusters (
          id,
          cluster:clusters (
            id,
            name
          )
        ),
        team_teams!team_teams_first_team_id_fkey (
          second_team:teams!team_teams_second_team_id_fkey (
            id,
            name
          )
        ),
        other_teams:team_teams!team_teams_second_team_id_fkey (
          first_team:teams!team_teams_first_team_id_fkey (
            id,
            name
          )
        )
      `)
      .eq("id", teamId)
      .single()

    if (teamError || !team) {
      return null
    }

    // Uniamo i team connessi da entrambe le direzioni
    const connectedTeams = [
      ...(team.team_teams || []).map(t => t.second_team),
      ...(team.other_teams || []).map(t => t.first_team)
    ].filter((t): t is NonNullable<typeof t> => t !== null)

    return {
      id: team.id,
      name: team.name,
      is_project: team.project || false,
      leader: team.leader,
      clusters: team.team_clusters
        ?.filter((tc): tc is typeof tc & { cluster: NonNullable<typeof tc.cluster> } => 
          tc.cluster !== null
        )
        .map((tc) => ({
          id: tc.cluster.id,
          name: tc.cluster.name
        })) || [],
      connected_teams: connectedTeams
    }
  } catch (err) {
    console.error("Errore nel recupero dei dettagli del team:", err)
    throw err
  }
}

export async function createTeamConnection(firstTeamId: string, secondTeamId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Ordina gli ID alfabeticamente per mantenere consistenza
    const [orderedFirstTeamId, orderedSecondTeamId] = [firstTeamId, secondTeamId].sort()
    
    // Verifica se la connessione esiste già
    const { data: existingConnection, error: checkError } = await supabase
      .from("team_teams")
      .select("id")
      .eq("first_team_id", orderedFirstTeamId)
      .eq("second_team_id", orderedSecondTeamId)
      .single()

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = not found
      throw checkError
    }

    if (existingConnection) {
      return { success: false, error: "La connessione tra i team esiste già" }
    }

    // Crea la nuova connessione
    const { error: insertError } = await supabase
      .from("team_teams")
      .insert({
        first_team_id: orderedFirstTeamId,
        second_team_id: orderedSecondTeamId
      })

    if (insertError) {
      throw insertError
    }

    // Invalida la cache per entrambi i team
    revalidatePath(`/teams/${firstTeamId}`)
    revalidatePath(`/teams/${secondTeamId}`)
    revalidatePath("/admin/teams")

    return { success: true }
  } catch (err) {
    console.error("Errore nella creazione della connessione tra team:", err)
    return { success: false, error: "Errore nella creazione della connessione" }
  }
}

export async function deleteTeamConnection(firstTeamId: string, secondTeamId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Ordina gli ID alfabeticamente per mantenere consistenza
    const [orderedFirstTeamId, orderedSecondTeamId] = [firstTeamId, secondTeamId].sort()
    
    // Elimina la connessione
    const { error: deleteError } = await supabase
      .from("team_teams")
      .delete()
      .eq("first_team_id", orderedFirstTeamId)
      .eq("second_team_id", orderedSecondTeamId)

    if (deleteError) {
      throw deleteError
    }

    // Invalida la cache per entrambi i team
    revalidatePath(`/teams/${firstTeamId}`)
    revalidatePath(`/teams/${secondTeamId}`)
    revalidatePath("/admin/teams")

    return { success: true }
  } catch (err) {
    console.error("Errore nell'eliminazione della connessione tra team:", err)
    return { success: false, error: "Errore nell'eliminazione della connessione" }
  }
}
