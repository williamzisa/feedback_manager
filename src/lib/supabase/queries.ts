import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { QuestionInsert, QuestionUpdate } from "../types/questions";
import type { Level } from "../types/levels";
import type { TeamCreateData, TeamUpdateData } from "../types/teams";
import type { Database } from "./database.types";
import type { PreSessionStats } from "../types/feedbacks";
import { redirect } from "next/navigation";

// Definisco interfacce temporanee per mantenere compatibilità
type RuleInsert = Database['public']['Tables']['rules']['Insert'];
type RuleUpdate = Database['public']['Tables']['rules']['Update'];

// Definizione del tipo utente per evitare errori di type checking
type UserData = Database['public']['Tables']['users']['Row'];

export const queries = {
  // Users
  users: {
    getCurrentUser: async (): Promise<UserData> => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Invece di lanciare un errore, reindirizza alla pagina di login
          redirect("/login");
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("Errore auth.getUser:", authError);
          redirect("/login");
        }
        if (!user) {
          redirect("/login");
        }

        const { data: checkData, error: checkError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id);

        if (checkError) {
          console.error("Errore nella query di controllo:", checkError);
          throw new Error(`Errore nel controllo utente: ${checkError.message}`);
        }

        if (!checkData || checkData.length === 0) {
          throw new Error("Utente non trovato nel database");
        }

        if (checkData.length > 1) {
          console.error("Errore di integrità:", checkData);
          throw new Error("Errore di integrità: trovati multipli utenti con lo stesso auth_id");
        }

        const userData = checkData[0] as UserData;

        if (!userData.company) {
          throw new Error("Company non configurata per questo utente");
        }

        return userData;
      } catch (err) {
        console.error("Errore getCurrentUser:", err);
        if (err instanceof Error && err.message.includes("login")) {
          redirect("/login");
        }
        throw err;
      }
    },

    getCurrentUserClient: async (): Promise<UserData> => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Su client side, possiamo usare window.location per redirect
          // Poiché redirect() di Next.js funziona solo su server components
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          // Ritorniamo una Promise che non si risolve mai, ma TypeScript richiede un tipo
          // Questo codice non verrà mai eseguito perché il redirect avviene prima
          throw new Error("Sessione non valida");
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("Errore auth.getUser:", authError);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return new Promise(() => {});
        }
        if (!user) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return new Promise(() => {});
        }

        const { data: checkData, error: checkError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id);

        if (checkError) {
          console.error("Errore nella query di controllo:", checkError);
          throw new Error(`Errore nel controllo utente: ${checkError.message}`);
        }

        if (!checkData || checkData.length === 0) {
          throw new Error("Utente non trovato nel database");
        }

        if (checkData.length > 1) {
          console.error("Errore di integrità:", checkData);
          throw new Error("Errore di integrità: trovati multipli utenti con lo stesso auth_id");
        }

        const userData = checkData[0];

        if (!userData.company) {
          throw new Error("Company non configurata per questo utente");
        }

        return userData;
      } catch (err) {
        console.error("Errore getCurrentUser:", err);
        if (err instanceof Error && err.message.includes("login")) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return new Promise(() => {});
        }
        throw err;
      }
    },

    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            id,
            name,
            surname,
            email,
            level,
            mentor,
            company,
            admin,
            status,
            auth_id,
            created_at,
            last_login
          `
          )
          .order("name");

        if (error) {
          console.error("Errore nel recupero degli utenti:", error.message);
          throw new Error(`Errore nel recupero degli utenti: ${error.message}`);
        }

        if (!data) {
          console.error("Nessun dato ricevuto dal database");
          throw new Error("Nessun dato ricevuto dal database");
        }

        return data;
      } catch (err) {
        console.error("Errore nel recupero degli utenti:", err);
        throw new Error(
          err instanceof Error
            ? err.message
            : "Errore sconosciuto nel recupero degli utenti"
        );
      }
    },

    getAllByCompany: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Prima otteniamo l'utente corrente per trovare la sua company
        const currentUser = await queries.users.getCurrentUserClient();
        
        if (!currentUser || !currentUser.company) {
          throw new Error("Utente non autorizzato o company non configurata");
        }

        // Poi recuperiamo tutti gli utenti della stessa company
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            id,
            name,
            surname,
            email,
            level,
            mentor,
            company,
            admin,
            status,
            auth_id,
            created_at,
            last_login
          `
          )
          .eq("company", currentUser.company)
          .order("name");

        if (error) {
          console.error("Errore nel recupero degli utenti:", error.message);
          throw new Error(`Errore nel recupero degli utenti: ${error.message}`);
        }

        if (!data) {
          console.error("Nessun dato ricevuto dal database");
          throw new Error("Nessun dato ricevuto dal database");
        }

        return data;
      } catch (err) {
        console.error("Errore nel recupero degli utenti per company:", err);
        throw new Error(
          err instanceof Error
            ? err.message
            : "Errore sconosciuto nel recupero degli utenti per company"
        );
      }
    },

    getById: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, auth_id, name, surname, email, company, level, mentor, admin, created_at"
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (userData: {
      name: string;
      surname: string;
      email: string;
      level: string | null;
      mentor: string | null;
      company: string | null;
      admin: boolean;
      status: string;
      auth_id: string | null;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Verifica che i campi obbligatori siano presenti
        if (!userData.company) {
          throw new Error("Company è un campo obbligatorio per la creazione dell'utente");
        }

        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: crypto.randomUUID(),
              ...userData,
              created_at: new Date().toISOString(),
              last_login: null,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Errore nella creazione dell'utente:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Errore nella creazione dell'utente: ${error.message}`);
        }

        if (!data) {
          throw new Error("Nessun dato ricevuto dopo la creazione dell'utente");
        }

        return data;
      } catch (err) {
        console.error("Errore nella creazione dell'utente:", err);
        if (err instanceof Error) {
          throw new Error(`Errore nella creazione dell'utente: ${err.message}`);
        } else {
          throw new Error("Errore sconosciuto nella creazione dell'utente");
        }
      }
    },

    update: async (
      id: string,
      userData: Partial<{
        name: string;
        surname: string;
        email: string;
        level: string | null;
        mentor: string | null;
        company: string | null;
        admin: boolean;
        status: string;
        auth_id: string | null;
      }>
    ) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Tentativo di aggiornamento utente:", { id, userData });

        const { data, error } = await supabase
          .from("users")
          .update(userData)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Errore Supabase nell'aggiornamento dell'utente:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw new Error(
            `Errore nell'aggiornamento dell'utente: ${error.message}`
          );
        }

        if (!data) {
          console.error("Nessun dato ricevuto dopo l'aggiornamento");
          throw new Error("Nessun dato ricevuto dopo l'aggiornamento");
        }

        console.log("Aggiornamento utente completato:", data);
        return data;
      } catch (err) {
        console.error("Errore catturato nell'aggiornamento dell'utente:", {
          error: err,
          message: err instanceof Error ? err.message : "Errore sconosciuto",
        });
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase.from("users").delete().eq("id", id);

        if (error) {
          console.error("Errore nell'eliminazione dell'utente:", error);
          throw error;
        }
      } catch (err) {
        console.error("Errore nell'eliminazione dell'utente:", err);
        throw err;
      }
    },

    getByCompany: async (companyId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            id,
            name,
            surname,
            email,
            level,
            mentor,
            company,
            admin,
            status,
            auth_id,
            created_at,
            last_login
          `
          )
          .eq("company", companyId)
          .order("name");

        if (error) {
          console.error("Errore nel recupero degli utenti per company:", error.message);
          throw new Error(`Errore nel recupero degli utenti per company: ${error.message}`);
        }

        if (!data) {
          console.error("Nessun dato ricevuto dal database");
          throw new Error("Nessun dato ricevuto dal database");
        }

        return data;
      } catch (err) {
        console.error("Errore nel recupero degli utenti per company:", err);
        throw new Error(
          err instanceof Error
            ? err.message
            : "Errore sconosciuto nel recupero degli utenti per company"
        );
      }
    },

    getMentees: async (mentorId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            *,
            user_sessions (
              val_overall,
              val_gap,
              level_standard,
              created_at
            )
          `
          )
          .eq("mentor", mentorId)
          .eq("status", "active")
          .order("name");

        if (error) {
          console.error("Errore nel recupero dei mentee:", error.message);
          throw new Error(`Errore nel recupero dei mentee: ${error.message}`);
        }

        // Ordiniamo le sessioni di ogni utente per data
        const processedData = data?.map((user) => ({
          ...user,
          user_sessions: user.user_sessions?.sort((a, b) => {
            if (!a.created_at) return 1;
            if (!b.created_at) return -1;
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }),
        })) || [];

        return { data: processedData, error: null };
      } catch (err) {
        console.error("Errore nel recupero dei mentee:", err);
        return {
          data: null,
          error:
            err instanceof Error
              ? err.message
              : "Errore sconosciuto nel recupero dei mentee",
        };
      }
    },
  },

  // Companies
  companies: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, created_at")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    create: async (company: { name: string }) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            id: crypto.randomUUID(),
            ...company,
          },
        ])
        .select("id, name, created_at")
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, company: { name?: string }) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("companies")
        .update(company)
        .eq("id", id)
        .select("id, name, created_at")
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
  },

  // Teams
  teams: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("teams")
          .select(
            `
            id,
            name,
            project,
            company,
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
            user_teams (
              id,
              user:users (
                id,
                name,
                surname
              )
            ),
            connections:team_teams!team_teams_first_team_id_fkey(first_team_id, second_team_id),
            reverse_connections:team_teams!team_teams_second_team_id_fkey(first_team_id, second_team_id)
          `
          )
          .eq("company", currentUser.company)
          .order("name");

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Nessun dato restituito da Supabase");
        }

        return data.map(
          (team) => ({
            id: team.id,
            name: team.name,
            is_project: team.project || false,
            company: team.company,
            leader: team.leader,
            team_clusters:
              team.team_clusters
                ?.filter(
                  (tc) => tc !== null && tc.cluster !== null
                )
                .map((tc) => ({
                  id: tc.id,
                  cluster: tc.cluster,
                })) || [],
            user_teams: team.user_teams || [],
            connections_count: (team.connections?.length || 0) + (team.reverse_connections?.length || 0)
          })
        );
      } catch (err) {
        console.error("Errore nel recupero dei team:", err);
        throw err;
      }
    },

    create: async (teamData: TeamCreateData) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Creazione team con dati:", teamData);

        if (!teamData.leaderId) {
          throw new Error("Il team leader è obbligatorio");
        }

        const { data, error } = await supabase
          .from("teams")
          .insert({
            name: teamData.name.trim(),
            leader: teamData.leaderId,
            project: teamData.is_project,
            company: teamData.company,
          })
          .select()
          .single();

        if (error) {
          console.error("Errore nella creazione del team:", error);
          throw error;
        }

        console.log("Team creato con successo:", data);
        return data;
      } catch (err) {
        console.error("Errore dettagliato nella creazione del team:", err);
        throw err;
      }
    },

    update: async (id: string, teamData: TeamUpdateData) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Aggiornamento team con dati:", teamData);

        if (!teamData.leaderId) {
          throw new Error("Il team leader è obbligatorio");
        }

        const { data, error } = await supabase
          .from("teams")
          .update({
            name: teamData.name.trim(),
            leader: teamData.leaderId,
            project: teamData.is_project,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Errore nell'aggiornamento del team:", error);
          throw error;
        }

        console.log("Team aggiornato con successo:", data);
        return data;
      } catch (err) {
        console.error("Errore dettagliato nell'aggiornamento del team:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // 1. Elimino prima le associazioni team_clusters
        await queries.team_clusters.deleteByTeamId(id);

        // 2. Elimino le associazioni user_teams
        const { error: userTeamsError } = await supabase
          .from("user_teams")
          .delete()
          .eq("team_id", id);

        if (userTeamsError) {
          console.error(
            "Errore nell'eliminazione delle associazioni user_teams:",
            userTeamsError
          );
          throw userTeamsError;
        }

        // 3. Infine elimino il team
        const { error: teamError } = await supabase
          .from("teams")
          .delete()
          .eq("id", id);

        if (teamError) {
          console.error("Errore nell'eliminazione del team:", teamError);
          throw teamError;
        }
      } catch (err) {
        console.error("Errore durante l'eliminazione del team:", err);
        throw err;
      }
    },

    getTeamConnections: async (teamId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Prima verifichiamo che il team appartenga alla company dell'utente
        const { error: teamError } = await supabase
          .from("teams")
          .select("id")
          .eq("id", teamId)
          .eq("company", currentUser.company)
          .single();

        if (teamError) {
          throw new Error("Team non trovato o non autorizzato");
        }

        const { data, error } = await supabase
          .from("team_teams")
          .select(`
            first_team:teams!team_teams_first_team_id_fkey (
              id,
              name,
              company
            ),
            second_team:teams!team_teams_second_team_id_fkey (
              id,
              name,
              company
            )
          `)
          .or(`first_team_id.eq.${teamId},second_team_id.eq.${teamId}`);

        if (error) {
          console.error("Errore nel recupero delle connessioni del team:", error);
          throw error;
        }

        // Mappiamo i dati per ottenere un array di team connessi
        // Filtriamo per assicurarci che i team connessi appartengano alla stessa company
        return (data || [])
          .filter(connection => {
            const otherTeam = connection.first_team.id === teamId 
              ? connection.second_team 
              : connection.first_team;
            return otherTeam.company === currentUser.company;
          })
          .map(connection => {
            // Se il team corrente è first_team, restituiamo second_team e viceversa
            const connectedTeam = connection.first_team.id === teamId 
              ? connection.second_team 
              : connection.first_team;
            
            return {
              id: connectedTeam.id,
              name: connectedTeam.name
            };
          });
      } catch (err) {
        console.error("Errore nel recupero delle connessioni del team:", err);
        throw err;
      }
    },

    createTeamConnection: async (firstTeamId: string, secondTeamId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che entrambi i team appartengano alla company dell'utente
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("id, company")
          .in("id", [firstTeamId, secondTeamId]);

        if (teamsError) {
          throw new Error("Errore nel verificare i team: " + teamsError.message);
        }

        if (teamsData.length !== 2) {
          throw new Error("Uno o entrambi i team non sono stati trovati");
        }

        // Verifichiamo che entrambi i team appartengano alla company dell'utente
        if (teamsData.some(team => team.company !== currentUser.company)) {
          throw new Error("Non hai i permessi per connettere questi team");
        }

        // Assicuriamo che first_team_id sia alfabeticamente minore di second_team_id
        const [first, second] = [firstTeamId, secondTeamId].sort();
        
        const { error } = await supabase
          .from("team_teams")
          .insert({
            first_team_id: first,
            second_team_id: second
          });

        if (error) {
          if (error.code === "23505") { // Codice per violazione unique constraint
            console.warn("Connessione già esistente tra i team");
            return;
          }
          console.error("Errore nella creazione della connessione:", error);
          throw error;
        }
      } catch (err) {
        console.error("Errore nella creazione della connessione:", err);
        throw err;
      }
    },

    deleteTeamConnection: async (firstTeamId: string, secondTeamId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che entrambi i team appartengano alla company dell'utente
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("id, company")
          .in("id", [firstTeamId, secondTeamId]);

        if (teamsError) {
          throw new Error("Errore nel verificare i team: " + teamsError.message);
        }

        if (teamsData.length !== 2) {
          throw new Error("Uno o entrambi i team non sono stati trovati");
        }

        // Verifichiamo che entrambi i team appartengano alla company dell'utente
        if (teamsData.some(team => team.company !== currentUser.company)) {
          throw new Error("Non hai i permessi per eliminare questa connessione");
        }

        // Assicuriamo che first_team_id sia alfabeticamente minore di second_team_id
        const [first, second] = [firstTeamId, secondTeamId].sort();
        
        const { error } = await supabase
          .from("team_teams")
          .delete()
          .eq("first_team_id", first)
          .eq("second_team_id", second);

        if (error) {
          console.error("Errore nell'eliminazione della connessione:", error);
          throw error;
        }
      } catch (err) {
        console.error("Errore nell'eliminazione della connessione:", err);
        throw err;
      }
    },
  },

  // Team Clusters
  team_clusters: {
    create: async (teamCluster: { team_id: string; cluster_id: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Creazione associazione team-cluster...");
        const { data, error } = await supabase
          .from("team_clusters")
          .insert({
            team_id: teamCluster.team_id,
            cluster_id: teamCluster.cluster_id,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "Errore nella creazione dell'associazione team-cluster:",
            error
          );
          throw error;
        }

        return data;
      } catch (err) {
        console.error(
          "Errore dettagliato nella creazione dell'associazione team-cluster:",
          err
        );
        throw err;
      }
    },

    deleteByTeamId: async (teamId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Eliminazione associazioni team-cluster...");
        const { error } = await supabase
          .from("team_clusters")
          .delete()
          .eq("team_id", teamId);

        if (error) {
          console.error(
            "Errore nell'eliminazione delle associazioni team-cluster:",
            error
          );
          throw error;
        }
      } catch (err) {
        console.error(
          "Errore dettagliato nell'eliminazione delle associazioni team-cluster:",
          err
        );
        throw err;
      }
    },
  },

  // User Teams (Memberships)
  userTeams: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Utilizziamo una query più specifica per ottenere solo i membri della stessa company
        const { data, error } = await supabase
          .from("user_teams")
          .select(`
            id,
            user_id,
            team_id,
            created_at,
            users:users!user_teams_user_id_fkey (
              id,
              name,
              surname,
              email,
              company
            ),
            teams:teams!user_teams_team_id_fkey (
              id,
              name,
              company
            )
          `)
          .eq("teams.company", currentUser.company)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Errore nel recupero delle user_teams:", error);
          throw error;
        }

        // Verifichiamo anche che sia gli utenti che i team abbiano la company corretta
        const filteredData = data.filter(membership => 
          membership.teams?.company === currentUser.company && 
          membership.users?.company === currentUser.company
        );

        return filteredData;
      } catch (err) {
        console.error("Errore nel recupero delle user_teams:", err);
        throw err;
      }
    },

    create: async (userTeam: { userId: string; teamId: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifica che il team appartenga alla stessa company dell'utente
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("company")
          .eq("id", userTeam.teamId)
          .single();

        if (teamError) {
          console.error("Errore nel recupero del team:", teamError);
          throw teamError;
        }

        if (teamData.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a creare membership per questo team");
        }

        // Verifica anche che l'utente appartenga alla stessa company
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company")
          .eq("id", userTeam.userId)
          .single();

        if (userError) {
          console.error("Errore nel recupero dell'utente:", userError);
          throw userError;
        }

        if (userData.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a creare membership per utenti di altre company");
        }

        const { data, error } = await supabase
          .from("user_teams")
          .insert([
            {
              id: crypto.randomUUID(),
              user_id: userTeam.userId,
              team_id: userTeam.teamId,
            },
          ])
          .select(`
            id,
            user_id,
            team_id,
            created_at,
            users:users!user_teams_user_id_fkey (
              id,
              name,
              surname,
              email,
              company
            ),
            teams:teams!user_teams_team_id_fkey (
              id,
              name,
              company
            )
          `)
          .single();

        if (error) {
          console.error("Errore nella creazione della user_team:", error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Errore nella creazione della user_team:", err);
        throw err;
      }
    },

    update: async (
      id: string,
      userTeam: { userId: string; teamId: string }
    ) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifica che il team appartenga alla stessa company dell'utente
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("company")
          .eq("id", userTeam.teamId)
          .single();

        if (teamError) {
          console.error("Errore nel recupero del team:", teamError);
          throw teamError;
        }

        if (teamData.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a modificare membership per questo team");
        }

        // Verifica anche che l'utente appartenga alla stessa company
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("company")
          .eq("id", userTeam.userId)
          .single();

        if (userError) {
          console.error("Errore nel recupero dell'utente:", userError);
          throw userError;
        }

        if (userData.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a modificare membership per utenti di altre company");
        }

        // Verifica che la membership esista e appartenga alla stessa company
        const { data: existingData, error: existingError } = await supabase
          .from("user_teams")
          .select(`
            id,
            teams:teams!user_teams_team_id_fkey (
              company
            )
          `)
          .eq("id", id)
          .single();

        if (existingError) {
          console.error("Errore nel recupero della membership esistente:", existingError);
          throw existingError;
        }

        if (!existingData.teams || existingData.teams.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a modificare questa membership");
        }

        const { data, error } = await supabase
          .from("user_teams")
          .update({
            user_id: userTeam.userId,
            team_id: userTeam.teamId,
          })
          .eq("id", id)
          .select(`
            id,
            user_id,
            team_id,
            created_at,
            users:users!user_teams_user_id_fkey (
              id,
              name,
              surname,
              email,
              company
            ),
            teams:teams!user_teams_team_id_fkey (
              id,
              name,
              company
            )
          `)
          .single();

        if (error) {
          console.error("Errore nell'aggiornamento della user_team:", error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Errore nell'aggiornamento della user_team:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifica che la membership appartenga alla stessa company dell'utente
        const { data: existingData, error: existingError } = await supabase
          .from("user_teams")
          .select(`
            id,
            teams:teams!user_teams_team_id_fkey (
              company
            ),
            users:users!user_teams_user_id_fkey (
              company
            )
          `)
          .eq("id", id)
          .single();

        if (existingError) {
          console.error("Errore nel recupero della membership:", existingError);
          throw existingError;
        }

        if (!existingData.teams || existingData.teams.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a eliminare questa membership: team di un'altra company");
        }

        if (!existingData.users || existingData.users.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a eliminare questa membership: utente di un'altra company");
        }

        const { error } = await supabase
          .from("user_teams")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Errore nell'eliminazione della user_team:", error);
          throw error;
        }
      } catch (err) {
        console.error("Errore nell'eliminazione della user_team:", err);
        throw err;
      }
    },
  },

  // Clusters
  clusters: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("clusters")
          .select(
            `
            id,
            name,
            level,
            leader,
            company,
            created_at,
            team_clusters (
              id,
              team_id
            )
          `
          )
          .eq("company", currentUser.company)
          .order("name");

        if (error) {
          console.error("Errore nel recupero dei cluster:", error);
          throw error;
        }

        return data.map((cluster) => ({
          ...cluster,
          team_count: cluster.team_clusters?.length || 0,
        }));
      } catch (err) {
        console.error("Errore nel recupero dei cluster:", err);
        throw err;
      }
    },

    create: async (cluster: {
      name: string;
      level: number | null;
      leader: string | null;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("clusters")
          .insert([
            {
              id: crypto.randomUUID(),
              name: cluster.name,
              level: cluster.level,
              leader: cluster.leader,
              company: currentUser.company,
            },
          ])
          .select(
            `
            id,
            name,
            level,
            leader,
            company,
            created_at,
            team_clusters (
              id,
              team_id
            )
          `
          )
          .single();

        if (error) {
          console.error("Errore nella creazione del cluster:", error);
          throw error;
        }

        return {
          ...data,
          team_count: data.team_clusters?.length || 0,
        };
      } catch (err) {
        console.error("Errore nella creazione del cluster:", err);
        throw err;
      }
    },

    update: async (
      id: string,
      cluster: { name: string; level: number | null; leader: string | null }
    ) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che il cluster appartenga alla company dell'utente
        const { error: checkError } = await supabase
          .from("clusters")
          .select("id")
          .eq("id", id)
          .eq("company", currentUser.company)
          .single();

        if (checkError) {
          throw new Error("Cluster non trovato o non autorizzato");
        }
          
        const { data, error } = await supabase
          .from("clusters")
          .update({
            name: cluster.name,
            level: cluster.level,
            leader: cluster.leader,
          })
          .eq("id", id)
          .eq("company", currentUser.company)
          .select(
            `
            id,
            name,
            level,
            leader,
            company,
            created_at,
            team_clusters (
              id,
              team_id
            )
          `
          )
          .single();

        if (error) {
          console.error("Errore nell'aggiornamento del cluster:", error);
          throw error;
        }

        return {
          ...data,
          team_count: data.team_clusters?.length || 0,
        };
      } catch (err) {
        console.error("Errore nell'aggiornamento del cluster:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che il cluster appartenga alla company dell'utente
        const { error: checkError } = await supabase
          .from("clusters")
          .select("id")
          .eq("id", id)
          .eq("company", currentUser.company)
          .single();

        if (checkError) {
          throw new Error("Cluster non trovato o non autorizzato");
        }
        
        const { error } = await supabase
          .from("clusters")
          .delete()
          .eq("id", id)
          .eq("company", currentUser.company);

        if (error) {
          console.error("Errore nell'eliminazione del cluster:", error);
          throw error;
        }
      } catch (err) {
        console.error("Errore nell'eliminazione del cluster:", err);
        throw err;
      }
    },
  },

  // Levels
  levels: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore nel recupero dei livelli:", error);
        throw error;
      }
      return data;
    },

    create: async (level: Omit<Level, "id" | "created_at">) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Tentativo di creazione livello:", level);

        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error: insertError } = await supabase
          .from("levels")
          .insert({
            id: crypto.randomUUID(),
            company: currentUser.company,
            role: level.role,
            step: level.step,
            execution_weight: level.execution_weight,
            soft_weight: level.soft_weight,
            strategy_weight: level.strategy_weight,
            standard: level.standard,
          })
          .select(
            "id, role, step, execution_weight, soft_weight, strategy_weight, standard, created_at"
          )
          .single();

        if (insertError) {
          console.error("Errore inserimento:", insertError);
          throw new Error(
            "Errore durante l'inserimento: " + insertError.message
          );
        }

        if (!data) {
          throw new Error("Nessun dato restituito dopo la creazione");
        }

        console.log("Livello creato con successo:", data);
        return data;
      } catch (err) {
        console.error("Errore completo nella creazione del livello:", err);
        throw err;
      }
    },

    update: async (
      id: string,
      level: Partial<Omit<Level, "id" | "created_at">>
    ) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log("Tentativo di aggiornamento livello:", { id, level });

        const { data, error } = await supabase
          .from("levels")
          .update({
            role: level.role,
            step: level.step,
            execution_weight: level.execution_weight,
            soft_weight: level.soft_weight,
            strategy_weight: level.strategy_weight,
            standard: level.standard,
            company: level.company,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Errore nell'aggiornamento del livello:", error);
          throw error;
        }

        console.log("Livello aggiornato con successo:", data);
        return data;
      } catch (err) {
        console.error("Errore nell'aggiornamento del livello:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase.from("levels").delete().eq("id", id);

      if (error) throw error;
    },

    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("levels")
          .select("*")
          .eq("company", company)
          .order("step");

        if (error) {
          console.error("Errore nel recupero dei livelli:", error.message);
          throw new Error(`Errore nel recupero dei livelli: ${error.message}`);
        }

        return data || [];
      } catch (err) {
        console.error("Errore nel recupero dei livelli:", err);
        throw new Error(
          err instanceof Error
            ? err.message
            : "Errore sconosciuto nel recupero dei livelli"
        );
      }
    },
  },

  // Processes
  processes: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("processes")
          .select(
            `
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `
          )
          .order("name");

        if (error) {
          console.error("Errore nel recupero dei processi:", error);
          throw error;
        }

        return data.map((process) => ({
          id: process.id,
          name: process.name,
          linked_question_id: process.linked_question_id,
          linked_question: process.questions,
          user_count: process.user_processes?.length || 0,
          company: process.company,
          created_at: process.created_at,
        }));
      } catch (err) {
        console.error("Errore nel recupero dei processi:", err);
        throw err;
      }
    },

    getByCompany: async (companyId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("processes")
          .select(
            `
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `
          )
          .eq("company", companyId)
          .order("name");

        if (error) {
          console.error("Errore nel recupero dei processi per company:", error);
          throw error;
        }

        return data.map((process) => ({
          id: process.id,
          name: process.name,
          linked_question_id: process.linked_question_id,
          linked_question: process.questions,
          user_count: process.user_processes?.length || 0,
          company: process.company,
          created_at: process.created_at,
        }));
      } catch (err) {
        console.error("Errore nel recupero dei processi per company:", err);
        throw err;
      }
    },

    create: async (processData: {
      name: string;
      linked_question_id: string;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("processes")
          .insert({
            name: processData.name.trim(),
            linked_question_id: processData.linked_question_id,
            company: currentUser.company,
          })
          .select(
            `
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `
          )
          .single();

        if (error) {
          console.error("Errore nella creazione del processo:", error);
          throw error;
        }

        return {
          id: data.id,
          name: data.name,
          linked_question_id: data.linked_question_id,
          linked_question: data.questions,
          user_count: data.user_processes?.length || 0,
          company: data.company,
          created_at: data.created_at,
        };
      } catch (err) {
        console.error("Errore nella creazione del processo:", err);
        throw err;
      }
    },

    update: async (
      id: string,
      processData: { name: string; linked_question_id: string }
    ) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che il processo appartenga alla company dell'utente
        const { data: processCheck, error: checkError } = await supabase
          .from("processes")
          .select("company")
          .eq("id", id)
          .single();

        if (checkError) {
          console.error("Errore nella verifica del processo:", checkError);
          throw checkError;
        }

        if (processCheck.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a modificare questo processo");
        }

        const { data, error } = await supabase
          .from("processes")
          .update({
            name: processData.name.trim(),
            linked_question_id: processData.linked_question_id,
          })
          .eq("id", id)
          .eq("company", currentUser.company) // Verifica ulteriore
          .select(
            `
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `
          )
          .single();

        if (error) {
          console.error("Errore nell'aggiornamento del processo:", error);
          throw error;
        }

        return {
          id: data.id,
          name: data.name,
          linked_question_id: data.linked_question_id,
          linked_question: data.questions,
          user_count: data.user_processes?.length || 0,
          company: data.company,
          created_at: data.created_at,
        };
      } catch (err) {
        console.error("Errore nell'aggiornamento del processo:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che il processo appartenga alla company dell'utente
        const { data: processCheck, error: checkError } = await supabase
          .from("processes")
          .select("company")
          .eq("id", id)
          .single();

        if (checkError) {
          console.error("Errore nella verifica del processo:", checkError);
          throw checkError;
        }

        if (processCheck.company !== currentUser.company) {
          throw new Error("Non sei autorizzato a eliminare questo processo");
        }

        // Prima elimino le associazioni user_processes
        const { error: userProcessesError } = await supabase
          .from("user_processes")
          .delete()
          .eq("process_id", id);

        if (userProcessesError) {
          console.error(
            "Errore nell'eliminazione delle associazioni user_processes:",
            userProcessesError
          );
          throw userProcessesError;
        }

        // Poi elimino il processo
        const { error: processError } = await supabase
          .from("processes")
          .delete()
          .eq("id", id)
          .eq("company", currentUser.company); // Verifica ulteriore

        if (processError) {
          console.error("Errore nell'eliminazione del processo:", processError);
          throw processError;
        }
      } catch (err) {
        console.error("Errore nell'eliminazione del processo:", err);
        throw err;
      }
    },
  },

  // Questions
  questions: {
    async getAll() {
      const supabase = createClientComponentClient<Database>()
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            tags_count:question_tags(count)
          `)
          .eq('company', currentUser.company)
          .order('created_at', { ascending: false })

        if (error) {
          console.error("Errore nel recupero delle domande:", error)
          throw error
        }

        return data?.map(question => ({
          ...question,
          tags_count: question.tags_count?.[0]?.count || 0
        })) || []
      } catch (err) {
        console.error("Errore nella query delle domande:", err)
        throw err
      }
    },

    create: async (question: Omit<QuestionInsert, "id">) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("questions")
          .insert({
            id: crypto.randomUUID(),
            description: question.description,
            type: question.type,
            company: currentUser.company,
          })
          .select("id, description, type, created_at, company")
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Errore nella creazione della domanda:", err);
        throw err;
      }
    },

    update: async (id: string, question: QuestionUpdate) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("questions")
          .update({
            description: question.description,
            type: question.type,
            company: currentUser.company,
          })
          .eq("id", id)
          .select("id, description, type, created_at, company")
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Errore nell'aggiornamento della domanda:", err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Verifichiamo che la domanda appartenga alla company dell'utente
        const { error: checkError } = await supabase
          .from("questions")
          .select("id")
          .eq("id", id)
          .eq("company", currentUser.company)
          .single();

        if (checkError) {
          throw new Error("Domanda non trovata o non autorizzata");
        }

        const { error } = await supabase
          .from("questions")
          .delete()
          .eq("id", id)
          .eq("company", currentUser.company);
          
        if (error) throw error;
      } catch (err) {
        console.error("Errore nell'eliminazione della domanda:", err);
        throw err;
      }
    },

    // NUOVA FUNZIONE AGGIUNTA QUI
    async getAvailableForProcess(currentLinkedQuestionId?: string) {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUserClient(); // Usiamo Client per componenti client
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }
        const companyId = currentUser.company;

        // 1. Recupera tutti i linked_question_id usati dai processi della company
        const { data: linkedIdsData, error: linkedIdsError } = await supabase
          .from('processes')
          .select('linked_question_id')
          .eq('company', companyId)
          .not('linked_question_id', 'is', null);

        if (linkedIdsError) {
          console.error("Errore nel recupero dei linked_question_id:", linkedIdsError);
          throw linkedIdsError;
        }
        // Rimuoviamo l'ID corrente (se presente) dalla lista degli ID collegati,
        // così la domanda corrente sarà sempre selezionabile in modalità modifica.
        const linkedQuestionIds = new Set(linkedIdsData.map(p => p.linked_question_id).filter(id => id !== currentLinkedQuestionId));

        // 2. Recupera tutte le domande 'execution' della company
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('id, description')
          .eq('company', companyId)
          .ilike('type', 'execution'); // Filtro case-insensitive

        if (questionsError) {
          console.error("Errore nel recupero delle domande execution:", questionsError);
          throw questionsError;
        }

        // 3. Filtra le domande: non devono avere un ID presente in linkedQuestionIds
        const availableQuestions = questionsData.filter(q =>
          !linkedQuestionIds.has(q.id)
        );

        return availableQuestions;

      } catch (err) {
        console.error("Errore nel recupero delle domande disponibili per i processi:", err);
        throw err;
      }
    },
    // FINE NUOVA FUNZIONE
  },

  rules: {
    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("rules")
        .select("*")
        .eq("company", company)
        .order("number", { ascending: true });

      if (error) throw error;
      return data;
    },

    create: async (rule: RuleInsert) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("rules")
        .insert([rule])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: RuleUpdate) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from("rules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase.from("rules").delete().eq("id", id);

      if (error) throw error;
    },
  },

  // Sessions
  sessions: {
    create: async (sessionData: {
      name: string;
      start_time: string | null;
      end_time: string | null;
      clusters: string[];
      rules?: string[]; // Rendo rules opzionale
      status?: string;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // 1. Creiamo la sessione
        const { data: session, error: sessionError } = await supabase
          .from("sessions")
          .insert({
            id: crypto.randomUUID(),
            name: sessionData.name,
            start_time: sessionData.start_time,
            end_time: sessionData.end_time,
            status: sessionData.status || "In preparazione",
            company: currentUser.company,
          })
          .select()
          .single();

        if (sessionError) {
          console.error("Errore nella creazione della sessione:", sessionError);
          throw sessionError;
        }

        // 2. Creiamo le associazioni session_clusters
        if (sessionData.clusters.length > 0) {
          const { error: clustersError } = await supabase
            .from("session_clusters")
            .insert(
              sessionData.clusters.map((clusterId) => ({
                id: crypto.randomUUID(),
                session_id: session.id,
                cluster_id: clusterId,
              }))
            );

          if (clustersError) {
            console.error(
              "Errore nella creazione delle associazioni session_clusters:",
              clustersError
            );
            throw clustersError;
          }
        }

        // 3. Creiamo le associazioni session_rules
        if (sessionData.rules && sessionData.rules.length > 0) {
          const { error: rulesError } = await supabase
            .from("session_rules")
            .insert(
              sessionData.rules.map((ruleId) => ({
                id: crypto.randomUUID(),
                session_id: session.id,
                rule_id: ruleId,
              }))
            );

          if (rulesError) {
            console.error(
              "Errore nella creazione delle associazioni session_rules:",
              rulesError
            );
            throw rulesError;
          }
        }

        return session;
      } catch (err) {
        console.error("Errore nella creazione della sessione:", err);
        throw err;
      }
    },

    update: async (
      sessionId: string,
      sessionData: {
        name: string;
        start_time: string | null;
        end_time: string | null;
        clusters: string[];
        rules?: string[]; // Rendo rules opzionale
        status?: string;
      }
    ) => {
      const supabase = createClientComponentClient<Database>();

      // Aggiorniamo la sessione
      const { data: session, error } = await supabase
        .from("sessions")
        .update({
          name: sessionData.name,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          status: sessionData.status,
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      if (!session)
        throw new Error("Errore durante l'aggiornamento della sessione");

      // Aggiorniamo le associazioni con i cluster
      // Prima eliminiamo tutte le associazioni esistenti
      const { error: deleteClusterError } = await supabase
        .from("session_clusters")
        .delete()
        .eq("session_id", sessionId);
      if (deleteClusterError) throw deleteClusterError;

      // Poi creiamo le nuove associazioni
      if (sessionData.clusters.length > 0) {
        const { error: clustersError } = await supabase
          .from("session_clusters")
          .insert(
            sessionData.clusters.map((clusterId) => ({
              session_id: sessionId,
              cluster_id: clusterId,
            }))
          );
        if (clustersError) throw clustersError;
      }

      // Aggiorniamo le associazioni con le regole
      // Prima eliminiamo tutte le associazioni esistenti
      const { error: deleteRulesError } = await supabase
        .from("session_rules")
        .delete()
        .eq("session_id", sessionId);
      if (deleteRulesError) throw deleteRulesError;

      // Poi creiamo le nuove associazioni
      if (sessionData.rules && sessionData.rules.length > 0) {
        const { error: rulesError } = await supabase
          .from("session_rules")
          .insert(
            sessionData.rules.map((ruleId) => ({
              session_id: sessionId,
              rule_id: ruleId,
            }))
          );
        if (rulesError) throw rulesError;
      }

      return session;
    },

    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("sessions")
          .select(
            `
            *,
            session_clusters (
              id,
              cluster:clusters (
                id,
                name
              )
            ),
            session_rules (
              id,
              rule:rules (
                id,
                name
              )
            )
          `
          )
          .eq("company", company)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Errore nel recupero delle sessioni:", error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error("Errore nel recupero delle sessioni:", err);
        throw err;
      }
    },

    getUserSessions: async (userId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        const { data, error } = await supabase
          .from("sessions")
          .select(
            `
            *,
            session_clusters!inner (
              id,
              cluster:clusters!inner (
                id,
                name,
                team_clusters!inner (
                  id,
                  team:teams!inner (
                    id,
                    user_teams!inner (
                      id,
                      user_id
                    )
                  )
                )
              )
            )
          `
          )
          .eq("company", currentUser.company)
          .neq("status", "In preparazione")
          .eq(
            "session_clusters.cluster.team_clusters.team.user_teams.user_id",
            userId
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error(
            "Errore nel recupero delle sessioni dell'utente:",
            error
          );
          throw error;
        }

        // Trasformiamo i dati nel formato atteso dal tipo Session
        const formattedData =
          data?.map((session) => ({
            ...session,
            session_clusters: session.session_clusters.map((sc) => ({
              id: sc.id,
              cluster: {
                id: sc.cluster.id,
                name: sc.cluster.name,
              },
            })),
          })) || [];

        return formattedData;
      } catch (err) {
        console.error("Errore nel recupero delle sessioni dell'utente:", err);
        throw err;
      }
    },

    getSessionResults: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error("Company non configurata per questo utente");
        }

        // Eseguiamo la query per ottenere i risultati delle sessioni
        // filtrando per utenti della stessa company dell'utente corrente
        const { data, error } = await supabase
          .from("user_sessions")
          .select(`
            *,
            users!inner (
              id,
              name,
              surname,
              company
            ),
            sessions!inner (
              id,
              name,
              company
            )
          `)
          .eq("users.company", currentUser.company)
          .eq("sessions.company", currentUser.company)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Errore nel recupero dei risultati delle sessioni:", error);
          throw error;
        }

        if (!data) {
          return [];
        }

        // Funzione helper per formattare i numeri a 2 decimali
        const formatNumber = (num: number | null): number => {
          if (num === null) return 0;
          return Number(num.toFixed(2));
        };

        // Trasformiamo i dati nel formato richiesto dall'interfaccia
        return data.map(result => ({
          id: `${result.session_id}_${result.user_id}`,
          session_name: result.sessions.name,
          level_name: result.level_name || "",
          user_name: `${result.users.name} ${result.users.surname}`,
          overall: formatNumber(result.val_overall),
          gap: formatNumber(result.val_gap), // Il gap è già in percentuale, non moltiplicare
          execution: formatNumber(result.val_execution),
          strategy: formatNumber(result.val_strategy),
          soft: formatNumber(result.val_soft)
        }));
      } catch (err) {
        console.error("Errore nel recupero dei risultati delle sessioni:", err);
        throw err;
      }
    },

    updateStatus: async (sessionId: string, status: string) => {
      const supabase = createClientComponentClient<Database>();
      
      // Aggiorniamo SOLO lo stato della sessione
      const { data: session, error } = await supabase
        .from("sessions")
        .update({ status })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) throw error;
      if (!session)
        throw new Error("Errore durante l'aggiornamento dello stato della sessione");

      return session;
    },
  },

  // Feedbacks
  feedbacks: {
    getBySession: async (sessionId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("feedbacks")
          .select(
            `
            *,
            sender:users!feedbacks_sender_fkey (
              id,
              name,
              surname
            ),
            receiver:users!feedbacks_receiver_fkey (
              id,
              name,
              surname
            ),
            question:questions (
              id,
              description,
              type
            ),
            rule:rules (
              id,
              name,
              number
            )
          `
          )
          .eq("session_id", sessionId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Errore nel recupero dei feedback:", error);
          throw error;
        }

        return data.map((feedback) => ({
          id: feedback.id,
          sender: feedback.sender
            ? `${feedback.sender.name} ${feedback.sender.surname}`
            : "",
          receiver: feedback.receiver
            ? `${feedback.receiver.name} ${feedback.receiver.surname}`
            : "",
          question: feedback.question?.description || "",
          rule: feedback.rule_number || 0,
          tags: [], // TODO: Implementare i tag quando disponibili
          value: feedback.value,
          comment: feedback.comment,
        }));
      } catch (err) {
        console.error("Errore nel recupero dei feedback:", err);
        throw err;
      }
    },

    generateForRule: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sessionId: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ruleId: string
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const supabase = createClientComponentClient<Database>();
      try {
        // TODO: Implementare la generazione dei feedback per una regola
        throw new Error("Non implementato");
      } catch (err) {
        console.error("Errore nella generazione dei feedback:", err);
        throw err;
      }
    },
  },

  // Session Stats
  sessionStats: {
    getStats: async (sessionId: string): Promise<PreSessionStats> => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Ottieni il numero totale di feedback
        const { count: totalFeedbacks, error: feedbackError } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);

        if (feedbackError) throw feedbackError;

        // Ottieni il numero di utenti coinvolti nella sessione
        const { data: userSessions, error: userSessionsError } = await supabase
          .from("user_sessions")
          .select("user_id")
          .eq("session_id", sessionId);

        if (userSessionsError) throw userSessionsError;

        const totalUsers = userSessions.length;

        // Ottieni il numero di utenti senza feedback
        const { data: usersWithFeedback, error: usersError } = await supabase
          .from("feedbacks")
          .select("receiver")
          .eq("session_id", sessionId)
          .not("receiver", "is", null);

        if (usersError) throw usersError;

        const uniqueUsersWithFeedback = new Set(
          usersWithFeedback.map((f) => f.receiver)
        ).size;
        const usersWithNoFeedbacks = totalUsers - uniqueUsersWithFeedback;

        // Calcola la media di feedback per utente
        const avgFeedbacksPerUser =
          totalUsers > 0 ? (totalFeedbacks || 0) / totalUsers : 0;

        return {
          totalFeedbacks: totalFeedbacks || 0,
          avgFeedbacksPerUser: Number(avgFeedbacksPerUser.toFixed(1)),
          usersWithNoFeedbacks,
          totalUsers,
        };
      } catch (err) {
        console.error("Errore nel calcolo delle statistiche:", err);
        throw err;
      }
    },
  },

  // User Processes
  user_processes: {
    assignProcessToUser: async (userId: string, processId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("user_processes")
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            process_id: processId
          })
          .select("*")
          .single();

        if (error) {
          console.error("Errore nell'assegnazione del processo all'utente:", error.message);
          throw new Error(`Errore nell'assegnazione del processo all'utente: ${error.message}`);
        }

        return data;
      } catch (err) {
        console.error("Errore nell'assegnazione del processo all'utente:", err);
        throw err;
      }
    },

    removeProcessFromUser: async (userId: string, processId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("user_processes")
          .delete()
          .match({ user_id: userId, process_id: processId })
          .select("*")
          .single();

        if (error) {
          console.error("Errore nella rimozione del processo dall'utente:", error.message);
          throw new Error(`Errore nella rimozione del processo dall'utente: ${error.message}`);
        }

        return data;
      } catch (err) {
        console.error("Errore nella rimozione del processo dall'utente:", err);
        throw err;
      }
    },

    getByUserId: async (userId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from("user_processes")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Errore nel recupero dei processi dell'utente:", error.message);
          throw new Error(`Errore nel recupero dei processi dell'utente: ${error.message}`);
        }

        return data || [];
      } catch (err) {
        console.error("Errore nel recupero dei processi dell'utente:", err);
        throw err;
      }
    },

    syncUserProcesses: async (userId: string, processIds: string[]) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Prima otteniamo i processi attualmente assegnati all'utente
        const { data: currentProcesses, error: fetchError } = await supabase
          .from("user_processes")
          .select("process_id")
          .eq("user_id", userId);

        if (fetchError) {
          console.error("Errore nel recupero dei processi attuali:", fetchError.message);
          throw new Error(`Errore nel recupero dei processi attuali: ${fetchError.message}`);
        }

        const currentProcessIds = (currentProcesses || []).map(p => p.process_id).filter(Boolean) as string[];
        
        // Processi da aggiungere (presenti nel nuovo array ma non nell'attuale)
        const processesToAdd = processIds.filter(id => !currentProcessIds.includes(id));
        
        // Processi da rimuovere (presenti nell'attuale ma non nel nuovo array)
        const processesToRemove = currentProcessIds.filter(id => !processIds.includes(id));

        // Rimuovi i processi non più selezionati
        if (processesToRemove.length > 0) {
          const { error: removeError } = await supabase
            .from("user_processes")
            .delete()
            .eq("user_id", userId)
            .in("process_id", processesToRemove);

          if (removeError) {
            console.error("Errore nella rimozione dei processi:", removeError.message);
            throw new Error(`Errore nella rimozione dei processi: ${removeError.message}`);
          }
        }

        // Aggiungi i nuovi processi selezionati
        if (processesToAdd.length > 0) {
          const newUserProcesses = processesToAdd.map(processId => ({
            id: crypto.randomUUID(),
            user_id: userId,
            process_id: processId
          }));

          const { error: addError } = await supabase
            .from("user_processes")
            .insert(newUserProcesses);

          if (addError) {
            console.error("Errore nell'aggiunta dei processi:", addError.message);
            throw new Error(`Errore nell'aggiunta dei processi: ${addError.message}`);
          }
        }

        return true;
      } catch (err) {
        console.error("Errore nella sincronizzazione dei processi dell'utente:", err);
        throw err;
      }
    }
  },

  tags: {
    async getForQuestion(questionId: string) {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('question_tags')
        .select('*')
        .eq('question_id', questionId)
        .order('score');

      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }

      return data;
    },
    
    async getQuestionsWithTags() {
      const supabase = createClientComponentClient<Database>();
      
      try {
        // Prima recuperiamo l'utente corrente per trovare la sua company
        const currentUser = await queries.users.getCurrentUserClient();
        
        if (!currentUser || !currentUser.company) {
          throw new Error("Utente non autorizzato o company non configurata");
        }
        
        // Recuperiamo tutte le domande con i loro tag
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            description,
            type,
            tags:question_tags(id)
          `)
          .eq('company', currentUser.company)
          .order('description');

        if (error) {
          throw error;
        }

        // Filtriamo le domande che hanno effettivamente dei tag (count > 0)
        return (data || []).filter(question => question.tags && question.tags.length > 0);
      } catch (error) {
        console.error('Error fetching questions with tags:', error);
        return [];
      }
    }
  }
};

export async function getSessionFeedback(sessionId: string, userId: string) {
  const supabase = createClientComponentClient<Database>();
  try {
    // Prima recupera i dati della sessione utente e della sessione
    const { data: userSession, error: userSessionError } = await supabase
      .from("user_sessions")
      .select(
        `
        *,
        session:sessions (
          id,
          name,
          end_time,
          status
        ),
        user:users!user_sessions_user_id_fkey (
          mentor
        )
      `
      )
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .single();

    if (userSessionError) {
      console.error(
        "Errore nel recupero della sessione utente:",
        userSessionError
      );
      throw userSessionError;
    }

    // Poi recupera i feedback con tutti i campi necessari
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from("feedbacks")
      .select(
        `
        *,
        sender:users!feedbacks_sender_fkey(
          id,
          name, 
          surname
        ),
        receiver:users!feedbacks_receiver_fkey(
          id,
          name, 
          surname
        ),
        question:questions(
          id,
          description,
          type
        )
      `
      )
      .eq("session_id", sessionId)
      .eq("receiver", userId)
      .not("sender", "eq", userId); // Escludiamo i self-feedback

    if (feedbacksError) {
      console.error("Errore nel recupero dei feedback:", feedbacksError);
      throw feedbacksError;
    }

    // Recupera i self-feedback separatamente
    const { data: selfFeedbacks, error: selfFeedbacksError } = await supabase
      .from("feedbacks")
      .select(
        `
        *,
        question:questions(
          id,
          description,
          type
        )
      `
      )
      .eq("session_id", sessionId)
      .eq("receiver", userId)
      .eq("sender", userId);

    if (selfFeedbacksError) {
      console.error("Errore nel recupero dei self-feedback:", selfFeedbacksError);
      throw selfFeedbacksError;
    }

    // Organizziamo i feedback per question_id
    const feedbacksByQuestion = feedbacks.reduce((acc, feedback) => {
      const questionId = feedback.question?.id;
      if (!questionId || !feedback.question) return acc;
      
      if (!acc[questionId]) {
        acc[questionId] = {
          question: feedback.question,
          feedbacks: [],
          overall: 0,
          count: 0,
          commentCount: 0,
          mentorValue: 0
        };
      }
      
      // Aggiungiamo solo i feedback con value > 0
      if (feedback.value && feedback.value > 0) {
        acc[questionId].feedbacks.push(feedback);
        acc[questionId].count++;
        
        // Contiamo i commenti validi
        if (feedback.comment) {
          acc[questionId].commentCount++;
        }
        
        // Ricalcoliamo l'overall solo per i feedback validi
        const validValues = acc[questionId].feedbacks
          .map(f => f.value || 0)
          .filter(v => v > 0);
        
        acc[questionId].overall = validValues.length > 0 
          ? validValues.reduce((a, b) => a + b, 0) / validValues.length 
          : 0;

        // Calcola il valore del mentor per questa domanda specifica
        if (userSession.user?.mentor && feedback.sender?.id === userSession.user.mentor) {
          acc[questionId].mentorValue = feedback.value;
        }
      }
      
      return acc;
    }, {} as Record<string, {
      question: { id: string; description: string; type: string };
      feedbacks: typeof feedbacks;
      overall: number;
      count: number;
      commentCount: number;
      mentorValue: number;
    }>);

    // Organizziamo i self-feedback per question_id
    const selfFeedbacksByQuestion = selfFeedbacks.reduce((acc, feedback) => {
      const questionId = feedback.question?.id;
      if (!questionId) return acc;
      acc[questionId] = feedback;
      return acc;
    }, {} as Record<string, typeof selfFeedbacks[0]>);

    return {
      userSession: {
        ...userSession,
        session_name: userSession.session?.name || "",
        session_end_time: userSession.session?.end_time || null
      },
      feedbacksByQuestion,
      selfFeedbacksByQuestion
    };
  } catch (err) {
    console.error("Errore nel recupero dei feedback:", err);
    throw err;
  }
}

export async function getSessionComments(sessionId: string, userId: string) {
  const supabase = createClientComponentClient<Database>();
  try {
    const { data: feedbacks, error } = await supabase
      .from("snapshot_feedbacks")
      .select(
        `
        *,
        sender_name_surname,
        receiver_name_surname,
        questions_description
      `
      )
      .eq("session_id", sessionId)
      .eq("receiver", userId)
      .not("comment", "is", null)
      .not("comment", "eq", "");

    if (error) throw error;

    return feedbacks.map((feedback) => {
      // Dividiamo sender_name_surname in name e surname
      const [senderName = "", senderSurname = ""] = (feedback.sender_name_surname || "").split(" ");
      // Dividiamo receiver_name_surname in name e surname
      const [receiverName = "", receiverSurname = ""] = (feedback.receiver_name_surname || "").split(" ");

      return {
        id: feedback.id,
        question_id: feedback.question_id,
        value: feedback.value,
        session_id: feedback.session_id,
        rule_id: null,
        rule_number: feedback.rule_number,
        comment: feedback.comment,
        company: feedback.company,
        created_at: feedback.created_at,
        sender: { id: feedback.sender || "", name: senderName, surname: senderSurname },
        receiver: { id: feedback.receiver || "", name: receiverName, surname: receiverSurname },
        question: { 
          id: feedback.question_id || "",
          description: feedback.questions_description || "",
          type: ""
        },
        sender_name_surname: feedback.sender_name_surname,
        receiver_name_surname: feedback.receiver_name_surname,
        questions_description: feedback.questions_description,
      };
    });
  } catch (err) {
    console.error("Errore nel recupero dei commenti:", err);
    throw err;
  }
}
