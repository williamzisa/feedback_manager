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

export async function getUserProcesses(userId: string) {
  try {
    const supabase = await getServerSupabase()
    
    const { data, error } = await supabase
      .from("user_processes")
      .select(`
        id,
        process:processes (
          id,
          name,
          created_at,
          questions:questions!processes_linked_question_id_fkey (
            id,
            description,
            type
          ),
          team_processes (
            team:teams (
              id,
              name
            )
          )
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Errore nel recupero dei processi dell'utente:", error)
      throw error
    }

    // Formatta i dati per l'interfaccia utente
    return data
      .filter((up): up is typeof up & { process: NonNullable<typeof up.process> } => up.process !== null)
      .map(up => ({
        id: up.process.id,
        name: up.process.name,
        question: up.process.questions ? {
          id: up.process.questions.id,
          description: up.process.questions.description,
          type: up.process.questions.type
        } : null,
        team: up.process.team_processes?.[0]?.team?.name || null,
        created_at: up.process.created_at
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error("Errore nel recupero dei processi dell'utente:", err)
    throw err
  }
}

export async function assignProcessToUser(userId: string, processId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Verifica che l'utente stia assegnando il processo a se stesso
    const currentUser = await getCurrentUser()
    if (currentUser.id !== userId) {
      return { success: false, error: "Non puoi assegnare processi ad altri utenti" }
    }

    // Verifica che il processo appartenga a un team di cui l'utente fa parte
    const { data: teamProcesses, error: teamCheckError } = await supabase
      .from("team_processes")
      .select(`
        team:teams!inner (
          id,
          user_teams!inner (
            user_id
          )
        )
      `)
      .eq("process_id", processId)
      .eq("team.user_teams.user_id", userId)

    if (teamCheckError) {
      return { success: false, error: "Errore nella verifica dell'appartenenza al team" }
    }

    if (!teamProcesses || teamProcesses.length === 0) {
      return { success: false, error: "Il processo non appartiene a nessun team di cui fai parte" }
    }

    // Verifica se l'assegnazione esiste già
    const { data: existingAssignment, error: checkError } = await supabase
      .from("user_processes")
      .select("id")
      .eq("user_id", userId)
      .eq("process_id", processId)
      .single()

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = not found
      return { success: false, error: "Errore nella verifica dell'assegnazione esistente" }
    }

    if (existingAssignment) {
      return { success: false, error: "Processo già assegnato all'utente" }
    }

    // Crea la nuova assegnazione
    const { error: insertError } = await supabase
      .from("user_processes")
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        process_id: processId
      })

    if (insertError) {
      return { success: false, error: "Errore nell'assegnazione del processo" }
    }

    // Invalida la cache dei processi dell'utente
    revalidatePath("/processes")
    
    return { success: true }
  } catch (err) {
    console.error("Errore nell'assegnazione del processo:", err)
    return { success: false, error: "Errore nell'assegnazione del processo" }
  }
}

export async function removeProcessFromUser(userId: string, processId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Verifica che l'utente stia rimuovendo il processo da se stesso
    const currentUser = await getCurrentUser()
    if (currentUser.id !== userId) {
      return { success: false, error: "Non puoi rimuovere processi da altri utenti" }
    }

    // Rimuovi l'assegnazione
    const { error } = await supabase
      .from("user_processes")
      .delete()
      .eq("user_id", userId)
      .eq("process_id", processId)

    if (error) {
      return { success: false, error: "Errore nella rimozione del processo" }
    }

    // Invalida la cache dei processi dell'utente
    revalidatePath("/processes")
    
    return { success: true }
  } catch (err) {
    console.error("Errore nella rimozione del processo:", err)
    return { success: false, error: "Errore nella rimozione del processo" }
  }
}

export async function getAvailableTeamProcesses(userId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Ottieni prima tutti i processi dei team dell'utente
    const { data: teamProcesses, error: teamError } = await supabase
      .from("team_processes")
      .select(`
        process_id,
        team:teams!inner (
          id,
          name,
          user_teams!inner (
            user_id
          )
        )
      `)
      .eq("team.user_teams.user_id", userId)

    if (teamError) {
      console.error("Errore nel recupero dei processi dei team:", teamError)
      throw teamError
    }

    if (!teamProcesses || teamProcesses.length === 0) {
      return []
    }

    // Estrai gli ID dei processi del team
    const teamProcessIds = teamProcesses.map(tp => tp.process_id)
    
    // Ottieni i processi già assegnati all'utente
    const { data: userProcesses, error: userError } = await supabase
      .from("user_processes")
      .select("process_id")
      .eq("user_id", userId)
      .in("process_id", teamProcessIds)

    if (userError) {
      console.error("Errore nel recupero dei processi dell'utente:", userError)
      throw userError
    }
    
    // Crea un set di ID dei processi già assegnati all'utente
    const assignedProcessIds = new Set(userProcesses.map(up => up.process_id))
    
    // Filtra i processi dei team per escludere quelli già assegnati
    const availableTeamProcessIds = teamProcesses
      .filter(tp => !assignedProcessIds.has(tp.process_id))
      .map(tp => tp.process_id)
    
    if (availableTeamProcessIds.length === 0) {
      return []
    }
    
    // Ottieni i dettagli completi dei processi disponibili
    const { data: availableProcesses, error: processError } = await supabase
      .from("processes")
      .select(`
        id,
        name,
        questions:questions!processes_linked_question_id_fkey (
          id,
          description,
          type
        ),
        team_processes (
          team:teams (
            id,
            name
          )
        )
      `)
      .in("id", availableTeamProcessIds)

    if (processError) {
      console.error("Errore nel recupero dei dettagli dei processi:", processError)
      throw processError
    }
    
    // Crea una mappa per associare i processi ai team
    const processTeamMap = new Map()
    teamProcesses.forEach(tp => {
      processTeamMap.set(tp.process_id, tp.team.name)
    })

    // Formatta i dati per l'interfaccia utente
    return availableProcesses.map(process => ({
      id: process.id,
      name: process.name,
      question: process.questions ? {
        id: process.questions.id,
        description: process.questions.description,
        type: process.questions.type
      } : null,
      team: processTeamMap.get(process.id) || process.team_processes?.[0]?.team?.name || null
    }))
  } catch (err) {
    console.error("Errore nel recupero dei processi disponibili:", err)
    throw err
  }
}

export async function getTeamProcesses(teamId: string) {
  try {
    const supabase = await getServerSupabase()
    
    const { data, error } = await supabase
      .from("team_processes")
      .select(`
        id,
        process:processes (
          id,
          name,
          linked_question_id,
          questions:questions!processes_linked_question_id_fkey (
            id,
            description
          )
        )
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Errore nel recupero dei processi del team:", error)
      throw error
    }

    return data
      .filter((tp): tp is typeof tp & { process: NonNullable<typeof tp.process> } => 
        tp.process !== null
      )
      .map(tp => ({
        id: tp.id,
        process: {
          id: tp.process.id,
          name: tp.process.name,
          linked_question: tp.process.questions ? {
            id: tp.process.questions.id,
            description: tp.process.questions.description
          } : null
        }
      }))
  } catch (err) {
    console.error("Errore nel recupero dei processi del team:", err)
    throw err
  }
}

export async function addProcessToTeam(teamId: string, processData: { name: string; linked_question_id: string }) {
  try {
    const supabase = await getServerSupabase()
    
    // 1. Creiamo prima il processo
    const { data: process, error: processError } = await supabase
      .from("processes")
      .insert({
        id: crypto.randomUUID(),
        name: processData.name.trim(),
        linked_question_id: processData.linked_question_id,
        company: (await getCurrentUser()).company!
      })
      .select()
      .single()

    if (processError) {
      console.error("Errore nella creazione del processo:", processError)
      throw processError
    }

    // 2. Associamo il processo al team
    const { error: teamProcessError } = await supabase
      .from("team_processes")
      .insert({
        id: crypto.randomUUID(),
        team_id: teamId,
        process_id: process.id
      })

    if (teamProcessError) {
      console.error("Errore nell'associazione del processo al team:", teamProcessError)
      throw teamProcessError
    }

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (err) {
    console.error("Errore nell'aggiunta del processo al team:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function removeProcessFromTeam(teamId: string, processId: string) {
  try {
    const supabase = await getServerSupabase()
    
    // Rimuoviamo solo l'associazione team_processes
    const { error: teamProcessError } = await supabase
      .from("team_processes")
      .delete()
      .eq("team_id", teamId)
      .eq("process_id", processId)

    if (teamProcessError) {
      throw teamProcessError
    }

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (err) {
    console.error("Errore nella rimozione del processo dal team:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function getQuestionTags(questionId: string) {
  try {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("question_tags")
      .select(`
        id,
        score,
        description
      `)
      .eq("question_id", questionId)
      .order("score", { ascending: true })

    if (error) {
      console.error("Errore nel recupero dei tag:", error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error("Errore nella query dei tag:", err)
    throw err
  }
}

export async function createQuestionTag(data: { question_id: string; score: number; description: string }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser.admin) {
      throw new Error("Non hai i permessi per creare tag")
    }

    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("question_tags")
      .insert({
        id: crypto.randomUUID(),
        question_id: data.question_id,
        score: data.score,
        description: data.description.trim(),
        company: currentUser.company!
      })

    if (error) {
      throw error
    }

    revalidatePath("/admin/questions")
    return { success: true }
  } catch (err) {
    console.error("Errore nella creazione del tag:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function updateQuestionTag(id: string, data: { score?: number; description?: string }) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser.admin) {
      throw new Error("Non hai i permessi per modificare tag")
    }

    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("question_tags")
      .update({
        ...(data.score !== undefined && { score: data.score }),
        ...(data.description !== undefined && { description: data.description.trim() })
      })
      .eq("id", id)
      .eq("company", currentUser.company!)

    if (error) {
      throw error
    }

    revalidatePath("/admin/questions")
    return { success: true }
  } catch (err) {
    console.error("Errore nell'aggiornamento del tag:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function deleteQuestionTag(id: string) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser.admin) {
      throw new Error("Non hai i permessi per eliminare tag")
    }

    const supabase = await getServerSupabase()
    const { error } = await supabase
      .from("question_tags")
      .delete()
      .eq("id", id)
      .eq("company", currentUser.company!)

    if (error) {
      throw error
    }

    revalidatePath("/admin/questions")
    return { success: true }
  } catch (err) {
    console.error("Errore nell'eliminazione del tag:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function getInitiativesByQuestionId(questionId: string) {
  try {
    const supabase = await getServerSupabase()
    
    const { data, error } = await supabase
      .from("initiatives")
      .select(`
        id,
        description,
        type,
        created_at,
        question:questions (
          id,
          description,
          type
        ),
        user:users (
          id,
          name,
          surname
        )
      `)
      .eq("question_id", questionId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Errore nel recupero delle iniziative:", error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error("Errore nella query delle iniziative:", err)
    throw err
  }
}

export async function createInitiative(data: {
  description: string
  question_id: string
  session_id: string
  type: "SOFT" | "STRATEGY" | "EXECUTION"
}) {
  try {
    const currentUser = await getCurrentUser()
    const supabase = await getServerSupabase()

    // Verifica che la domanda appartenga alla sessione corretta
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("type")
      .eq("id", data.question_id)
      .single()

    if (questionError || !question) {
      throw new Error("Domanda non trovata")
    }

    // Verifica che il tipo dell'iniziativa corrisponda al tipo della domanda
    if (question.type !== data.type) {
      throw new Error("Il tipo dell'iniziativa deve corrispondere al tipo della domanda")
    }

    const { error: insertError } = await supabase
      .from("initiatives")
      .insert({
        id: crypto.randomUUID(),
        description: data.description.trim(),
        question_id: data.question_id,
        session_id: data.session_id,
        type: data.type,
        user_id: currentUser.id
      })

    if (insertError) {
      throw insertError
    }

    // Invalida la cache della pagina dei risultati
    revalidatePath(`/session_results/feedback`)
    return { success: true }
  } catch (err) {
    console.error("Errore nella creazione dell'iniziativa:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function updateInitiative(
  id: string,
  data: { description: string }
) {
  try {
    const currentUser = await getCurrentUser()
    const supabase = await getServerSupabase()

    // Verifica che l'iniziativa appartenga all'utente corrente
    const { data: initiative, error: checkError } = await supabase
      .from("initiatives")
      .select("user_id")
      .eq("id", id)
      .single()

    if (checkError || !initiative) {
      throw new Error("Iniziativa non trovata")
    }

    if (initiative.user_id !== currentUser.id) {
      throw new Error("Non hai i permessi per modificare questa iniziativa")
    }

    const { error: updateError } = await supabase
      .from("initiatives")
      .update({
        description: data.description.trim()
      })
      .eq("id", id)
      .eq("user_id", currentUser.id)

    if (updateError) {
      throw updateError
    }

    // Invalida la cache della pagina dei risultati
    revalidatePath(`/session_results/feedback`)
    return { success: true }
  } catch (err) {
    console.error("Errore nell'aggiornamento dell'iniziativa:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}

export async function deleteInitiative(id: string) {
  try {
    const currentUser = await getCurrentUser()
    const supabase = await getServerSupabase()

    // Verifica che l'iniziativa appartenga all'utente corrente
    const { data: initiative, error: checkError } = await supabase
      .from("initiatives")
      .select("user_id")
      .eq("id", id)
      .single()

    if (checkError || !initiative) {
      throw new Error("Iniziativa non trovata")
    }

    if (initiative.user_id !== currentUser.id) {
      throw new Error("Non hai i permessi per eliminare questa iniziativa")
    }

    const { error: deleteError } = await supabase
      .from("initiatives")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id)

    if (deleteError) {
      throw deleteError
    }

    // Invalida la cache della pagina dei risultati
    revalidatePath(`/session_results/feedback`)
    return { success: true }
  } catch (err) {
    console.error("Errore nell'eliminazione dell'iniziativa:", err)
    return { success: false, error: err instanceof Error ? err.message : "Errore sconosciuto" }
  }
}
