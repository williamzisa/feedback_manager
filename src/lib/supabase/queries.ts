import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { QuestionInsert, QuestionUpdate } from '../types/questions'
import type { Level } from '../types/levels'
import type { TeamCreateData, TeamUpdateData } from '../types/teams'
import type { Database } from './database.types'
import type { RuleInsert, RuleUpdate } from '../types/rules'
import type { PreSessionStats } from '../types/feedbacks'

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
    }>) => {
      const supabase = createClientComponentClient<Database>();
      try {
        console.log('Tentativo di aggiornamento utente:', { id, userData });
        
        const { data, error } = await supabase
          .from('users')
          .update(userData)
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
              created_at
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

    create: async (cluster: { name: string; level: number | null; leader: string | null }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('clusters')
          .insert([{
            id: crypto.randomUUID(),
            name: cluster.name,
            level: cluster.level,
            leader: cluster.leader
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
        const { data, error } = await supabase
          .from('processes')
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
          .order('name');

        if (error) {
          console.error('Errore nel recupero dei processi:', error);
          throw error;
        }

        return data.map(process => ({
          id: process.id,
          name: process.name,
          linked_question_id: process.linked_question_id,
          linked_question: process.questions,
          user_count: process.user_processes?.length || 0,
          company: process.company,
          created_at: process.created_at
        }));
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
    }
  },

  // Feedbacks
  feedbacks: {
    getBySession: async (sessionId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('feedbacks')
          .select(`
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
          `)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore nel recupero dei feedback:', error);
          throw error;
        }

        return data.map(feedback => ({
          id: feedback.id,
          sender: feedback.sender ? `${feedback.sender.name} ${feedback.sender.surname}` : '',
          receiver: feedback.receiver ? `${feedback.receiver.name} ${feedback.receiver.surname}` : '',
          question: feedback.question?.description || '',
          rule: feedback.rule?.number || 0,
          tags: [], // TODO: Implementare i tag quando disponibili
          value: feedback.value,
          comment: feedback.comment
        }));
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
        // Ottieni il numero totale di feedback
        const { count: totalFeedbacks, error: feedbackError } = await supabase
          .from('feedbacks')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId);

        if (feedbackError) throw feedbackError;

        // Ottieni il numero di utenti coinvolti nella sessione
        const { data: userSessions, error: userSessionsError } = await supabase
          .from('user_sessions')
          .select('user_id')
          .eq('session_id', sessionId);

        if (userSessionsError) throw userSessionsError;

        const totalUsers = userSessions.length;

        // Ottieni il numero di utenti senza feedback
        const { data: usersWithFeedback, error: usersError } = await supabase
          .from('feedbacks')
          .select('receiver')
          .eq('session_id', sessionId)
          .not('receiver', 'is', null);

        if (usersError) throw usersError;

        const uniqueUsersWithFeedback = new Set(usersWithFeedback.map(f => f.receiver)).size;
        const usersWithNoFeedbacks = totalUsers - uniqueUsersWithFeedback;

        // Calcola la media di feedback per utente
        const avgFeedbacksPerUser = totalUsers > 0 ? (totalFeedbacks || 0) / totalUsers : 0;

        return {
          totalFeedbacks: totalFeedbacks || 0,
          avgFeedbacksPerUser: Number(avgFeedbacksPerUser.toFixed(1)),
          usersWithNoFeedbacks,
          totalUsers
        };
      } catch (err) {
        console.error('Errore nel calcolo delle statistiche:', err);
        throw err;
      }
    }
  }
}