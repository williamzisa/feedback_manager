import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { QuestionInsert, QuestionUpdate } from '../types/questions'
import type { Level } from '../types/levels'
import type { TeamCreateData, TeamUpdateData } from '../types/teams'
import type { Database } from './database.types'
import type { RuleInsert, RuleUpdate } from '../types/rules'
import type { PreSessionStats, Feedback } from '../types/feedbacks'

export const queries = {
  // Users
  users: {
    getCurrentUser: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) {
          throw new Error('Sessione non valida - effettua nuovamente il login');
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Errore auth.getUser:', authError);
          throw new Error('Errore di autenticazione - effettua nuovamente il login');
        }
        if (!user) {
          throw new Error('Utente non autenticato - effettua il login');
        }

        const { data: checkData, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id);
        
        if (checkError) {
          console.error('Errore nella query di controllo:', checkError);
          throw new Error(`Errore nel controllo utente: ${checkError.message}`);
        }
        
        if (!checkData || checkData.length === 0) {
          throw new Error('Utente non trovato nel database');
        }
        
        if (checkData.length > 1) {
          console.error('Errore di integrità:', checkData);
          throw new Error('Errore di integrità: trovati multipli utenti con lo stesso auth_id');
        }

        const userData = checkData[0];
        
        if (!userData.company) {
          throw new Error('Company non configurata per questo utente');
        }

        return userData;
      } catch (err) {
        console.error('Errore getCurrentUser:', err);
        throw err;
      }
    },

    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
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
          `)
          .order('name');

        if (error) {
          console.error('Errore nel recupero degli utenti:', error.message);
          throw new Error(`Errore nel recupero degli utenti: ${error.message}`);
        }

        if (!data) {
          console.error('Nessun dato ricevuto dal database');
          throw new Error('Nessun dato ricevuto dal database');
        }

        return data;
      } catch (err) {
        console.error('Errore nel recupero degli utenti:', err);
        throw new Error(err instanceof Error ? err.message : 'Errore sconosciuto nel recupero degli utenti');
      }
    },

    getById: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_id, name, surname, email, company, level, mentor, admin, created_at')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
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
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: crypto.randomUUID(),
            ...userData,
            created_at: new Date().toISOString(),
            last_login: null
          }])
          .select()
          .single();

        if (error) {
          console.error('Errore nella creazione dell\'utente:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore nella creazione dell\'utente:', err);
        throw err;
      }
    },

    update: async (id: string, userData: Partial<{
      name: string;
      surname: string;
      email: string;
      level: string | null;
      mentor: string | null;
      company: string | null;
      admin: boolean;
      status: string;
      auth_id: string | null;
      processes: string[];
    }>) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Tentativo di aggiornamento utente:', { id, userData });
        
        // Estrai i processi dai dati dell'utente
        const { processes, ...userDataWithoutProcesses } = userData;
        
        // Aggiorna i dati dell'utente
        const { data, error } = await supabase
          .from('users')
          .update(userDataWithoutProcesses)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Errore Supabase nell\'aggiornamento dell\'utente:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Errore nell'aggiornamento dell'utente: ${error.message}`);
        }

        if (!data) {
          console.error('Nessun dato ricevuto dopo l\'aggiornamento');
          throw new Error('Nessun dato ricevuto dopo l\'aggiornamento');
        }

        // Se sono stati forniti i processi, aggiorna le associazioni
        if (processes) {
          // Prima elimina tutte le associazioni esistenti
          await queries.userProcesses.deleteByUserId(id);

          // Poi crea le nuove associazioni
          for (const processId of processes) {
            await queries.userProcesses.create({ userId: id, processId });
          }
        }

        console.log('Aggiornamento utente completato:', data);
        return data;
      } catch (err) {
        console.error('Errore catturato nell\'aggiornamento dell\'utente:', {
          error: err,
          message: err instanceof Error ? err.message : 'Errore sconosciuto'
        });
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Errore nell\'eliminazione dell\'utente:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione dell\'utente:', err);
        throw err;
      }
    },

    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
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
          `)
          .eq('company', company)
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Errore nel recupero degli utenti:', error.message);
          throw new Error(`Errore nel recupero degli utenti: ${error.message}`);
        }

        return data || [];
      } catch (err) {
        console.error('Errore nel recupero degli utenti:', err);
        throw new Error(err instanceof Error ? err.message : 'Errore sconosciuto nel recupero degli utenti');
      }
    },

    getMentees: async (mentorId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            user_sessions (
              val_overall,
              val_gap,
              level_standard,
              created_at
            )
          `)
          .eq('mentor', mentorId)
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Errore nel recupero dei mentee:', error.message);
          throw new Error(`Errore nel recupero dei mentee: ${error.message}`);
        }

        // Ordiniamo le sessioni di ogni utente per data
        const processedData = data?.map(user => ({
          ...user,
          user_sessions: user.user_sessions?.sort((a, b) => {
            if (!a.created_at) return 1;
            if (!b.created_at) return -1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
        }));

        return { data: processedData, error: null };
      } catch (err) {
        console.error('Errore nel recupero dei mentee:', err);
        return { 
          data: null, 
          error: err instanceof Error ? err.message : 'Errore sconosciuto nel recupero dei mentee'
        };
      }
    },
  },

  // Companies
  companies: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, created_at')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
    create: async (company: { name: string }) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          id: crypto.randomUUID(),
          ...company
        }])
        .select('id, name, created_at')
        .single()
      if (error) throw error
      return data
    },
    update: async (id: string, company: { name?: string }) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', id)
        .select('id, name, created_at')
        .single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Teams
  teams: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Iniziando il recupero dei team...');
        
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
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
              user_id,
              created_at,
              user:users (
                id,
                name,
                surname
              )
            )
          `)
          .order('name');

        if (error) {
          console.error('Errore nel recupero dei team:', error);
          throw error;
        }

        if (!data) {
          console.log('Nessun dato restituito da Supabase');
          throw new Error('Nessun dato restituito da Supabase');
        }

        console.log('Team recuperati con successo:', data);

        return data.map((team: Database['public']['Tables']['teams']['Row'] & {
          leader: { id: string; name: string; surname: string } | null;
          team_clusters: Array<{ 
            id: string; 
            cluster: { id: string; name: string } | null 
          }> | null;
          user_teams: Array<{ 
            id: string; 
            user_id: string | null; 
            created_at: string | null 
          }> | null;
        }) => ({
          id: team.id,
          name: team.name,
          is_project: team.project || false,
          leader: team.leader,
          team_clusters: team.team_clusters?.filter((tc): tc is { id: string; cluster: { id: string; name: string } } => 
            tc !== null && tc.cluster !== null
          ).map(tc => ({
            id: tc.id,
            cluster: tc.cluster
          })) || [],
          user_teams: team.user_teams || []
        }));
      } catch (err) {
        console.error('Errore dettagliato nel recupero dei team:', err);
        throw err;
      }
    },

    create: async (teamData: TeamCreateData) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Creazione team con dati:', teamData);
        
        if (!teamData.leaderId) {
          throw new Error('Il team leader è obbligatorio');
        }

        const { data, error } = await supabase
          .from('teams')
          .insert({
            name: teamData.name.trim(),
            leader: teamData.leaderId,
            project: teamData.is_project,
            company: teamData.company
          })
          .select()
          .single();

        if (error) {
          console.error('Errore nella creazione del team:', error);
          throw error;
        }

        console.log('Team creato con successo:', data);
        return data;
      } catch (err) {
        console.error('Errore dettagliato nella creazione del team:', err);
        throw err;
      }
    },

    update: async (id: string, teamData: TeamUpdateData) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Aggiornamento team con dati:', teamData);
        
        if (!teamData.leaderId) {
          throw new Error('Il team leader è obbligatorio');
        }

        const { data, error } = await supabase
          .from('teams')
          .update({
            name: teamData.name.trim(),
            leader: teamData.leaderId,
            project: teamData.is_project
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento del team:', error);
          throw error;
        }

        console.log('Team aggiornato con successo:', data);
        return data;
      } catch (err) {
        console.error('Errore dettagliato nell\'aggiornamento del team:', err);
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
          .from('user_teams')
          .delete()
          .eq('team_id', id);

        if (userTeamsError) {
          console.error('Errore nell\'eliminazione delle associazioni user_teams:', userTeamsError);
          throw userTeamsError;
        }

        // 3. Infine elimino il team
        const { error: teamError } = await supabase
          .from('teams')
          .delete()
          .eq('id', id);

        if (teamError) {
          console.error('Errore nell\'eliminazione del team:', teamError);
          throw teamError;
        }
      } catch (err) {
        console.error('Errore durante l\'eliminazione del team:', err);
        throw err;
      }
    }
  },

  // Team Clusters
  team_clusters: {
    create: async (teamCluster: { team_id: string; cluster_id: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Creazione associazione team-cluster...');
        const { data, error } = await supabase
          .from('team_clusters')
          .insert({
            team_id: teamCluster.team_id,
            cluster_id: teamCluster.cluster_id
          })
          .select()
          .single();

        if (error) {
          console.error('Errore nella creazione dell\'associazione team-cluster:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore dettagliato nella creazione dell\'associazione team-cluster:', err);
        throw err;
      }
    },

    deleteByTeamId: async (teamId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Eliminazione associazioni team-cluster...');
        const { error } = await supabase
          .from('team_clusters')
          .delete()
          .eq('team_id', teamId);

        if (error) {
          console.error('Errore nell\'eliminazione delle associazioni team-cluster:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore dettagliato nell\'eliminazione delle associazioni team-cluster:', err);
        throw err;
      }
    }
  },

  // User Teams (Memberships)
  userTeams: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_teams')
          .select(`
            *,
            users (
              id,
              name,
              surname,
              email
            ),
            teams (
              id,
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore nel recupero delle user_teams:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore nel recupero delle user_teams:', err);
        throw err;
      }
    },

    create: async (userTeam: { userId: string; teamId: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_teams')
          .insert([{
            id: crypto.randomUUID(),
            user_id: userTeam.userId,
            team_id: userTeam.teamId
          }])
          .select(`
            *,
            users (
              id,
              name,
              surname,
              email
            ),
            teams (
              id,
              name
            )
          `)
          .single();

        if (error) {
          console.error('Errore nella creazione della user_team:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore nella creazione della user_team:', err);
        throw err;
      }
    },

    update: async (id: string, userTeam: { userId: string; teamId: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_teams')
          .update({
            user_id: userTeam.userId,
            team_id: userTeam.teamId
          })
          .eq('id', id)
          .select(`
            *,
            users (
              id,
              name,
              surname,
              email
            ),
            teams (
              id,
              name
            )
          `)
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento della user_team:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore nell\'aggiornamento della user_team:', err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('user_teams')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Errore nell\'eliminazione della user_team:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione della user_team:', err);
        throw err;
      }
    }
  },

  // Clusters
  clusters: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('clusters')
          .select(`
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
          `)
          .order('name');

        if (error) {
          console.error('Errore nel recupero dei cluster:', error);
          throw error;
        }

        return data.map(cluster => ({
          ...cluster,
          team_count: cluster.team_clusters?.length || 0
        }));
      } catch (err) {
        console.error('Errore nel recupero dei cluster:', err);
        throw err;
      }
    },

    create: async (cluster: { name: string; level: number | null; leader: string | null; company: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('clusters')
          .insert([{
            id: crypto.randomUUID(),
            name: cluster.name,
            level: cluster.level,
            leader: cluster.leader,
            company: cluster.company
          }])
          .select(`
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
          `)
          .single();

        if (error) {
          console.error('Errore nella creazione del cluster:', error);
          throw error;
        }

        return {
          ...data,
          team_count: data.team_clusters?.length || 0
        };
      } catch (err) {
        console.error('Errore nella creazione del cluster:', err);
        throw err;
      }
    },

    update: async (id: string, cluster: { name: string; level: number | null; leader: string | null }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('clusters')
          .update({
            name: cluster.name,
            level: cluster.level,
            leader: cluster.leader
          })
          .eq('id', id)
          .select(`
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
          `)
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento del cluster:', error);
          throw error;
        }

        return {
          ...data,
          team_count: data.team_clusters?.length || 0
        };
      } catch (err) {
        console.error('Errore nell\'aggiornamento del cluster:', err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('clusters')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Errore nell\'eliminazione del cluster:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione del cluster:', err);
        throw err;
      }
    }
  },

  // Levels
  levels: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel recupero dei livelli:', error)
        throw error
      }
      return data
    },

    create: async (level: Omit<Level, 'id' | 'created_at'>) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Tentativo di creazione livello:', level)

        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        const { data, error: insertError } = await supabase
          .from('levels')
          .insert({
            id: crypto.randomUUID(),
            company: currentUser.company,
            role: level.role,
            step: level.step,
            execution_weight: level.execution_weight,
            soft_weight: level.soft_weight,
            strategy_weight: level.strategy_weight,
            standard: level.standard
          })
          .select('id, role, step, execution_weight, soft_weight, strategy_weight, standard, created_at')
          .single()

        if (insertError) {
          console.error('Errore inserimento:', insertError)
          throw new Error('Errore durante l\'inserimento: ' + insertError.message)
        }
        
        if (!data) {
          throw new Error('Nessun dato restituito dopo la creazione')
        }

        console.log('Livello creato con successo:', data)
        return data
      } catch (err) {
        console.error('Errore completo nella creazione del livello:', err)
        throw err
      }
    },

    update: async (id: string, level: Partial<Omit<Level, 'id' | 'created_at'>>) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Tentativo di aggiornamento livello:', { id, level });

        const { data, error } = await supabase
          .from('levels')
          .update({
            role: level.role,
            step: level.step,
            execution_weight: level.execution_weight,
            soft_weight: level.soft_weight,
            strategy_weight: level.strategy_weight,
            standard: level.standard,
            company: level.company
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento del livello:', error);
          throw error;
        }

        console.log('Livello aggiornato con successo:', data);
        return data;
      } catch (err) {
        console.error('Errore nell\'aggiornamento del livello:', err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('levels')
          .select('*')
          .eq('company', company)
          .order('step');

        if (error) {
          console.error('Errore nel recupero dei livelli:', error.message);
          throw new Error(`Errore nel recupero dei livelli: ${error.message}`);
        }

        return data || [];
      } catch (err) {
        console.error('Errore nel recupero dei livelli:', err);
        throw new Error(err instanceof Error ? err.message : 'Errore sconosciuto nel recupero dei livelli');
      }
    },
  },

  // Processes
  processes: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Esecuzione query getAll processi');
        const { data, error } = await supabase
          .from('processes')
          .select(`
            id,
            name,
            company,
            created_at,
            linked_question_id,
            linked_question:questions!processes_linked_question_id_fkey (
              id,
              description
            ),
            user_processes (
              id
            )
          `);

        if (error) {
          console.error('Errore nel recupero dei processi:', error);
          throw error;
        }

        console.log('Processi recuperati dal database:', data);
        return data?.map(process => ({
          ...process,
          user_count: process.user_processes?.length || 0
        })) || [];
      } catch (err) {
        console.error('Errore nel recupero dei processi:', err);
        throw err;
      }
    },

    create: async (processData: { name: string, linked_question_id: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        const { data, error } = await supabase
          .from('processes')
          .insert({
            name: processData.name.trim(),
            linked_question_id: processData.linked_question_id,
            company: currentUser.company
          })
          .select(`
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `)
          .single();

        if (error) {
          console.error('Errore nella creazione del processo:', error);
          throw error;
        }

        return {
          id: data.id,
          name: data.name,
          linked_question_id: data.linked_question_id,
          linked_question: data.questions,
          user_count: data.user_processes?.length || 0,
          company: data.company,
          created_at: data.created_at
        };
      } catch (err) {
        console.error('Errore nella creazione del processo:', err);
        throw err;
      }
    },

    update: async (id: string, processData: { name: string, linked_question_id: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('processes')
          .update({
            name: processData.name.trim(),
            linked_question_id: processData.linked_question_id
          })
          .eq('id', id)
          .select(`
            *,
            user_processes (
              id,
              user_id
            ),
            questions!processes_linked_question_id_fkey (
              id,
              description
            )
          `)
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento del processo:', error);
          throw error;
        }

        return {
          id: data.id,
          name: data.name,
          linked_question_id: data.linked_question_id,
          linked_question: data.questions,
          user_count: data.user_processes?.length || 0,
          company: data.company,
          created_at: data.created_at
        };
      } catch (err) {
        console.error('Errore nell\'aggiornamento del processo:', err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Prima elimino le associazioni user_processes
        const { error: userProcessesError } = await supabase
          .from('user_processes')
          .delete()
          .eq('process_id', id);

        if (userProcessesError) {
          console.error('Errore nell\'eliminazione delle associazioni user_processes:', userProcessesError);
          throw userProcessesError;
        }

        // Poi elimino il processo
        const { error: processError } = await supabase
          .from('processes')
          .delete()
          .eq('id', id);

        if (processError) {
          console.error('Errore nell\'eliminazione del processo:', processError);
          throw processError;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione del processo:', err);
        throw err;
      }
    }
  },

  // Questions
  questions: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('id, description, type, created_at, company')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Errore nel recupero delle domande:', err);
        throw err;
      }
    },

    create: async (question: Omit<QuestionInsert, 'id'>) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        const { data, error } = await supabase
          .from('questions')
          .insert({
            id: crypto.randomUUID(),
            description: question.description,
            type: question.type,
            company: currentUser.company
          })
          .select('id, description, type, created_at, company')
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Errore nella creazione della domanda:', err);
        throw err;
      }
    },

    update: async (id: string, question: QuestionUpdate) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        const { data, error } = await supabase
          .from('questions')
          .update({
            description: question.description,
            type: question.type,
            company: currentUser.company
          })
          .eq('id', id)
          .select('id, description, type, created_at, company')
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Errore nell\'aggiornamento della domanda:', err);
        throw err;
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  rules: {
    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('company', company)
        .order('number', { ascending: true });

      if (error) throw error;
      return data;
    },

    create: async (rule: RuleInsert) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('rules')
        .insert([rule])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: RuleUpdate) => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  },

  // Sessions
  sessions: {
    create: async (sessionData: {
      name: string;
      start_time: string | null;
      end_time: string | null;
      clusters: string[];
      rules: string[];
      status?: string;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        // 1. Creiamo la sessione
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            id: crypto.randomUUID(),
            name: sessionData.name,
            start_time: sessionData.start_time,
            end_time: sessionData.end_time,
            status: sessionData.status || 'In preparazione',
            company: currentUser.company
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Errore nella creazione della sessione:', sessionError);
          throw sessionError;
        }

        // 2. Creiamo le associazioni session_clusters
        if (sessionData.clusters.length > 0) {
          const { error: clustersError } = await supabase
            .from('session_clusters')
            .insert(
              sessionData.clusters.map(clusterId => ({
                id: crypto.randomUUID(),
                session_id: session.id,
                cluster_id: clusterId
              }))
            );

          if (clustersError) {
            console.error('Errore nella creazione delle associazioni session_clusters:', clustersError);
            throw clustersError;
          }
        }

        // 3. Creiamo le associazioni session_rules
        if (sessionData.rules.length > 0) {
          const { error: rulesError } = await supabase
            .from('session_rules')
            .insert(
              sessionData.rules.map(ruleId => ({
                id: crypto.randomUUID(),
                session_id: session.id,
                rule_id: ruleId
              }))
            );

          if (rulesError) {
            console.error('Errore nella creazione delle associazioni session_rules:', rulesError);
            throw rulesError;
          }
        }

        return session;
      } catch (err) {
        console.error('Errore nella creazione della sessione:', err);
        throw err;
      }
    },

    update: async (sessionId: string, sessionData: {
      name: string;
      start_time: string | null;
      end_time: string | null;
      clusters: string[];
      rules: string[];
      status?: string;
    }) => {
      const supabase = createClientComponentClient<Database>()

      // Aggiorniamo la sessione
      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          name: sessionData.name,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          status: sessionData.status
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error
      if (!session) throw new Error('Errore durante l\'aggiornamento della sessione')

      // Aggiorniamo le associazioni con i cluster
      // Prima eliminiamo tutte le associazioni esistenti
      const { error: deleteClusterError } = await supabase
        .from('session_clusters')
        .delete()
        .eq('session_id', sessionId)
      if (deleteClusterError) throw deleteClusterError

      // Poi creiamo le nuove associazioni
      if (sessionData.clusters.length > 0) {
        const { error: clustersError } = await supabase
          .from('session_clusters')
          .insert(
            sessionData.clusters.map(clusterId => ({
              session_id: sessionId,
              cluster_id: clusterId
            }))
          )
        if (clustersError) throw clustersError
      }

      // Aggiorniamo le associazioni con le regole
      // Prima eliminiamo tutte le associazioni esistenti
      const { error: deleteRulesError } = await supabase
        .from('session_rules')
        .delete()
        .eq('session_id', sessionId)
      if (deleteRulesError) throw deleteRulesError

      // Poi creiamo le nuove associazioni
      if (sessionData.rules.length > 0) {
        const { error: rulesError } = await supabase
          .from('session_rules')
          .insert(
            sessionData.rules.map(ruleId => ({
              session_id: sessionId,
              rule_id: ruleId
            }))
          )
        if (rulesError) throw rulesError
      }

      return session
    },

    getByCompany: async (company: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select(`
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
          `)
          .eq('company', company)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore nel recupero delle sessioni:', error);
          throw error;
        }

        return data || [];
      } catch (err) {
        console.error('Errore nel recupero delle sessioni:', err);
        throw err;
      }
    },

    getUserSessions: async (userId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Otteniamo la company dell'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }

        const { data, error } = await supabase
          .from('sessions')
          .select(`
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
          `)
          .eq('company', currentUser.company)
          .neq('status', 'In preparazione')
          .eq('session_clusters.cluster.team_clusters.team.user_teams.user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore nel recupero delle sessioni dell\'utente:', error);
          throw error;
        }

        // Trasformiamo i dati nel formato atteso dal tipo Session
        const formattedData = data?.map(session => ({
          ...session,
          session_clusters: session.session_clusters.map(sc => ({
            id: sc.id,
            cluster: {
              id: sc.cluster.id,
              name: sc.cluster.name
            }
          }))
        })) || [];

        return formattedData;
      } catch (err) {
        console.error('Errore nel recupero delle sessioni dell\'utente:', err);
        throw err;
      }
    },

    generateUserSessions: async (sessionId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // 1. Otteniamo tutti gli utenti coinvolti nella sessione attraverso le relazioni
        const { data: sessionData, error: usersError } = await supabase
          .from('sessions')
          .select(`
            id,
            session_clusters!inner (
              cluster:clusters!inner (
                id,
                team_clusters!inner (
                  team:teams!inner (
                    id,
                    user_teams!inner (
                      user:users!inner (
                        id,
                        level (
                          id,
                          role,
                          step,
                          standard,
                          execution_weight,
                          strategy_weight,
                          soft_weight
                        )
                      )
                    )
                  )
                )
              )
            )
          `)
          .eq('id', sessionId)
          .single();

        if (usersError || !sessionData) {
          console.error('Errore nel recupero della sessione:', usersError);
          throw usersError || new Error('Sessione non trovata');
        }

        // Estraiamo gli utenti unici con i loro livelli
        const userMap = new Map<string, {
          userId: string,
          level: {
            role: string;
            step: number;
            standard: number;
            execution_weight: number;
            strategy_weight: number;
            soft_weight: number;
          }
        }>();

        sessionData.session_clusters.forEach(sc => {
          sc.cluster.team_clusters.forEach(tc => {
            tc.team?.user_teams.forEach(ut => {
              if (!ut.user) return;
              const level = ut.user.level;
              if (level?.role && typeof level.role === 'string') {
                userMap.set(ut.user.id, {
                  userId: ut.user.id,
                  level: {
                    role: level.role,
                    step: level.step,
                    standard: level.standard,
                    execution_weight: level.execution_weight,
                    strategy_weight: level.strategy_weight,
                    soft_weight: level.soft_weight
                  }
                });
              }
            });
          });
        });

        if (userMap.size === 0) {
          console.warn('Nessun utente trovato per la sessione');
          return [];
        }

        // 2. Otteniamo tutti i feedback della sessione
        const { data: feedbacks, error: feedbacksError } = await supabase
          .from('feedbacks')
          .select(`
            value,
            sender,
            receiver,
            question_id,
            comment,
            rule_id,
            rule_number,
            questions (
              id,
              description,
              type
            )
          `)
          .eq('session_id', sessionId)
          .not('value', 'is', null)
          .gt('value', 0);

        if (feedbacksError) {
          console.error('Errore nel recupero dei feedback:', feedbacksError);
          throw feedbacksError;
        }

        console.log('Numero totale di feedback trovati:', feedbacks.length);
        console.log('Esempio di feedback:', JSON.stringify(feedbacks[0], null, 2));

        // 3. Processiamo i feedback per ogni utente
        const userSessionsData = Array.from(userMap.values()).map(({ userId, level }) => {
          // Type guard per i feedback con valore valido
          const hasValidValue = (f: typeof feedbacks[0]): f is (typeof feedbacks[0] & { value: number }) => 
            f.value !== null && f.value > 0;

          const calculateAverage = (isSelf: boolean, type: string) => {
            const relevantFeedbacks = feedbacks
              .filter(hasValidValue)
              .filter(f => 
                f.receiver === userId && 
                f.questions?.type?.toLowerCase() === type.toLowerCase() &&
                (isSelf ? f.sender === userId : f.sender !== userId)
              );
            
            if (relevantFeedbacks.length === 0) return null;
            
            const sum = relevantFeedbacks.reduce((acc, f) => acc + f.value, 0);
            return sum / relevantFeedbacks.length;
          };

          // Calcolo medie per tipo
          const val_execution = calculateAverage(false, 'EXECUTION') || null;
          const val_strategy = calculateAverage(false, 'STRATEGY') || null;
          const val_soft = calculateAverage(false, 'SOFT') || null;
          const self_execution = calculateAverage(true, 'EXECUTION') || null;
          const self_strategy = calculateAverage(true, 'STRATEGY') || null;
          const self_soft = calculateAverage(true, 'SOFT') || null;

          // Calcolo media ponderata
          const calculateWeightedAverage = (vals: (number | null)[], weights: number[]) => {
            const validPairs = vals.map((v, i) => ({ val: v, weight: weights[i] }))
              .filter((p): p is { val: number; weight: number } => p.val !== null && p.val > 0);
            
            if (validPairs.length === 0) return null;
            
            const weightedSum = validPairs.reduce((sum, p) => sum + p.val * p.weight, 0);
            const totalWeight = validPairs.reduce((sum, p) => sum + p.weight, 0);
            
            return totalWeight > 0 ? weightedSum / totalWeight : null;
          };

          // Calcolo medie ponderate
          const val_overall = calculateWeightedAverage(
            [val_execution, val_strategy, val_soft],
            [level.execution_weight, level.strategy_weight, level.soft_weight]
          );

          const self_overall = calculateWeightedAverage(
            [self_execution, self_strategy, self_soft],
            [level.execution_weight, level.strategy_weight, level.soft_weight]
          );

          // Calcolo gap
          const val_gap = val_overall !== null && level.standard !== 0
            ? ((val_overall - level.standard) / level.standard)
            : null;

          return {
            session_id: sessionId,
            user_id: userId,
            level_name: `${level.role} ${level.step}`,
            level_standard: level.standard,
            weight_execution: level.execution_weight,
            weight_strategy: level.strategy_weight,
            weight_soft: level.soft_weight,
            val_execution,
            val_strategy,
            val_soft,
            val_overall,
            self_execution,
            self_strategy,
            self_soft,
            self_overall,
            val_gap
          };
        });

        // 4. Inseriamo tutti gli user_sessions
        const { error: insertError } = await supabase
          .from('user_sessions')
          .insert(userSessionsData);

        if (insertError) {
          console.error('Errore nell\'inserimento degli user_sessions:', insertError);
          throw insertError;
        }

        return userSessionsData;
      } catch (err) {
        console.error('Errore nella generazione degli user_sessions:', err);
        throw err;
      }
    },
  },

  // Feedbacks
  feedbacks: {
    getBySession: async (sessionId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        // Prima otteniamo il conteggio totale dei feedback
        const { count, error: countError } = await supabase
          .from('feedbacks')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId);

        if (countError) {
          console.error('Errore nel conteggio dei feedback:', countError);
          throw countError;
        }

        const totalCount = count || 0;
        const batchSize = 1000;
        const allFeedbacks: Feedback[] = [];

        // Recuperiamo i feedback in batch
        for (let from = 0; from < totalCount; from += batchSize) {
          const { data, error } = await supabase
            .from('feedbacks')
            .select(`
              id,
              sender,
              receiver,
              question_id,
              value,
              comment,
              rule_id,
              rule_number,
              questions!inner (
                id,
                description,
                type
              ),
              sender_user:users!feedbacks_sender_fkey!inner (
                name,
                surname
              ),
              receiver_user:users!feedbacks_receiver_fkey!inner (
                name,
                surname
              )
            `)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error(`Errore nel recupero del batch ${from}-${from + batchSize}:`, error);
            throw error;
          }

          if (data) {
            // Map dei risultati al tipo Feedback con controlli null-safety
            const mappedBatch = data
              .filter(feedback => feedback.sender_user && feedback.receiver_user && feedback.questions)
              .map(feedback => ({
                id: feedback.id,
                sender: `${feedback.sender_user!.name} ${feedback.sender_user!.surname}`,
                receiver: `${feedback.receiver_user!.name} ${feedback.receiver_user!.surname}`,
                question: feedback.questions!.description,
                value: feedback.value,
                comment: feedback.comment,
                rule: Number(feedback.rule_id) || 0,
                rule_number: feedback.rule_number,
                tags: [] as string[],
                questionType: feedback.questions!.type
              }));

            allFeedbacks.push(...mappedBatch);
          }

          console.log(`Recuperati ${allFeedbacks.length}/${totalCount} feedback`);
        }

        return allFeedbacks;
      } catch (err) {
        console.error('Errore nel recupero dei feedback:', err);
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
        throw new Error('Non implementato');
      } catch (err) {
        console.error('Errore nella generazione dei feedback:', err);
        throw err;
      }
    }
  },

  // Session Stats
  sessionStats: {
    getStats: async (sessionId: string): Promise<PreSessionStats> => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Getting stats for session:', sessionId);
        
        // Ottieni tutti i feedback con le informazioni necessarie
        const { data: allFeedbacks, error: allFeedbacksError } = await supabase
          .from('feedbacks')
          .select(`
            sender,
            receiver,
            question_id,
            sender_user:users!feedbacks_sender_fkey (
              name,
              surname
            ),
            receiver_user:users!feedbacks_receiver_fkey (
              name,
              surname
            )
          `)
          .eq('session_id', sessionId);

        if (allFeedbacksError) {
          console.error('Error fetching feedbacks:', allFeedbacksError);
          throw allFeedbacksError;
        }

        console.log('Received feedbacks:', allFeedbacks?.length, 'feedbacks');

        // Calcola i feedback duplicati
        const feedbackMap = new Map<string, number>();
        let duplicateFeedbacks = 0;

        allFeedbacks.forEach(feedback => {
          const key = `${feedback.sender}-${feedback.receiver}-${feedback.question_id}`;
          feedbackMap.set(key, (feedbackMap.get(key) || 0) + 1);
        });

        // Conta i duplicati (feedback con count > 1)
        feedbackMap.forEach(count => {
          if (count > 1) {
            duplicateFeedbacks += (count - 1);
          }
        });

        // Ottieni tutti gli utenti unici (sender e receiver) dai feedback con i loro dettagli
        const uniqueUsers = new Map<string, { name: string; surname: string }>();
        allFeedbacks.forEach(feedback => {
          if (feedback.sender && feedback.sender_user) {
            uniqueUsers.set(feedback.sender, {
              name: feedback.sender_user.name,
              surname: feedback.sender_user.surname
            });
          }
          if (feedback.receiver && feedback.receiver_user) {
            uniqueUsers.set(feedback.receiver, {
              name: feedback.receiver_user.name,
              surname: feedback.receiver_user.surname
            });
          }
        });

        // Ottieni gli utenti che hanno ricevuto feedback
        const receiversSet = new Set(allFeedbacks.filter(f => f.receiver).map(f => f.receiver));
        
        // Trova gli utenti senza feedback
        const usersWithNoFeedbacksDetails = Array.from(uniqueUsers.entries())
          .filter(([userId]) => !receiversSet.has(userId))
          .map(([, userDetails]) => userDetails);

        const totalUsers = uniqueUsers.size;
        const avgFeedbacksPerUser = totalUsers > 0 ? allFeedbacks.length / totalUsers : 0;

        return {
          totalFeedbacks: allFeedbacks.length,
          duplicateFeedbacks,
          usersWithNoFeedbacks: usersWithNoFeedbacksDetails.length,
          totalUsers,
          avgFeedbacksPerUser,
          usersWithNoFeedbacksDetails
        };
      } catch (err) {
        console.error('Errore nel calcolo delle statistiche:', err);
        throw err;
      }
    }
  },

  // User Sessions
  userSessions: {
    getAll: async () => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_sessions')
          .select(`
            *,
            session:sessions (
              id,
              name
            ),
            user:users (
              id,
              name,
              surname
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore nel recupero degli user_sessions:', error);
          throw error;
        }

        return data.map(us => ({
          ...us,
          session_name: us.session?.name || '',
          user_name: us.user ? `${us.user.name} ${us.user.surname}` : ''
        }));
      } catch (err) {
        console.error('Errore nel recupero degli user_sessions:', err);
        throw err;
      }
    }
  },

  // User Processes
  userProcesses: {
    create: async ({ userId, processId }: { userId: string; processId: string }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_processes')
          .insert({
            id: crypto.randomUUID(),
            user_id: userId,
            process_id: processId
          })
          .select()
          .single();

        if (error) {
          console.error('Errore nella creazione dell\'associazione user-process:', error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Errore nella creazione dell\'associazione user-process:', err);
        throw err;
      }
    },

    getByUserId: async (userId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('user_processes')
          .select('process_id')
          .eq('user_id', userId);

        if (error) throw error;
        return data.map(up => up.process_id).filter((id): id is string => id !== null);
      } catch (err) {
        console.error('Errore nel recupero dei processi dell\'utente:', err);
        throw err;
      }
    },

    deleteByUserAndProcess: async (userId: string, processId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('user_processes')
          .delete()
          .eq('user_id', userId)
          .eq('process_id', processId);

        if (error) {
          console.error('Errore nell\'eliminazione dell\'associazione user-process:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione dell\'associazione user-process:', err);
        throw err;
      }
    },

    deleteByUserId: async (userId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('user_processes')
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error('Errore nell\'eliminazione delle associazioni user-process:', error);
          throw error;
        }
      } catch (err) {
        console.error('Errore nell\'eliminazione delle associazioni user-process:', err);
        throw err;
      }
    }
  }
}