import { supabase } from './config'

export const queries = {
  // Users
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, surname, email, company, level, mentor, admin, created_at')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, surname, email, company, level, mentor, admin, created_at')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    create: async (user: { name: string; surname: string; email: string }) => {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: crypto.randomUUID(),
          ...user
        }])
        .select('id, name, surname, email, company, level, mentor, admin, created_at')
        .single()
      if (error) throw error
      return data
    },
    update: async (id: string, user: { name?: string; surname?: string; email?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select('id, name, surname, email, company, level, mentor, admin, created_at')
        .single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Companies
  companies: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, created_at')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
    create: async (company: { name: string }) => {
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
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, name, company, created_at, isclusterleader, project,
          leader:users(id, name, surname),
          team_clusters(
            id,
            cluster:clusters(id, name)
          ),
          user_teams(id, user_id, team_id, created_at)
        `)
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
    create: async (team: { 
      name: string; 
      leader: string | null; 
      isclusterleader: boolean | null;
      project: boolean | null;
    }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          id: crypto.randomUUID(),
          ...team
        }])
        .select(`
          id, name, company, created_at, isclusterleader, project,
          leader:users(id, name, surname),
          team_clusters(
            id,
            cluster:clusters(id, name)
          ),
          user_teams(id, user_id, team_id, created_at)
        `)
        .single()
      if (error) throw error
      return data
    },
    update: async (id: string, team: { name?: string; leader?: string | null; company?: string | null }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(team)
        .eq('id', id)
        .select(`
          id, name, company, created_at, isclusterleader, project,
          leader:users(id, name, surname),
          team_clusters(
            id,
            cluster:clusters(id, name)
          ),
          user_teams(id, user_id, team_id, created_at)
        `)
        .single()
      if (error) throw error
      return data
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  },

  // Team Clusters
  team_clusters: {
    create: async (teamCluster: { team_id: string; cluster_id: string }) => {
      const { data, error } = await supabase
        .from('team_clusters')
        .insert([{
          id: crypto.randomUUID(),
          ...teamCluster
        }])
        .select('id, team_id, cluster_id')
        .single()
      if (error) throw error
      return data
    },
    deleteByTeamId: async (teamId: string) => {
      const { error } = await supabase
        .from('team_clusters')
        .delete()
        .eq('team_id', teamId)
      if (error) throw error
    }
  },

  // User Teams
  user_teams: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('user_teams')
        .select('id, user_id, team_id, created_at')
      if (error) throw error
      return data
    },
    create: async (userTeam: { team_id: string; user_id: string }) => {
      const { data, error } = await supabase
        .from('user_teams')
        .insert([{
          id: crypto.randomUUID(),
          ...userTeam
        }])
        .select('id, user_id, team_id, created_at')
        .single()
      if (error) throw error
      return data
    },
    deleteByUserAndTeam: async (userId: string, teamId: string) => {
      const { error } = await supabase
        .from('user_teams')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId)
      if (error) throw error
    }
  },

  // Clusters
  clusters: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('clusters')
        .select(`
          id, name, level, created_at, company,
          leader:users!clusters_leader_fkey(
            id, name, surname
          ),
          team_clusters(
            id,
            team:teams(
              id,
              name,
              leader:users(id, name, surname)
            )
          )
        `)
        .order('name', { ascending: true })
      if (error) throw error
      return data.map(cluster => ({
        ...cluster,
        team_count: cluster.team_clusters?.length || 0
      }))
    },

    create: async (cluster: { name: string; level: number | null; leaderId: string | null }) => {
      const { data, error } = await supabase
        .from('clusters')
        .insert([{
          id: crypto.randomUUID(),
          name: cluster.name,
          level: cluster.level,
          leader: cluster.leaderId
        }])
        .select(`
          id, name, level, created_at, company,
          leader:users!clusters_leader_fkey(
            id, name, surname
          ),
          team_clusters(
            id,
            team:teams(
              id,
              name,
              leader:users(id, name, surname)
            )
          )
        `)
        .single()
      if (error) throw error
      return {
        ...data,
        team_count: data.team_clusters?.length || 0
      }
    },

    update: async (id: string, cluster: { name: string; level: number | null; leaderId: string | null }) => {
      const { data, error } = await supabase
        .from('clusters')
        .update({
          name: cluster.name,
          level: cluster.level,
          leader: cluster.leaderId
        })
        .eq('id', id)
        .select(`
          id, name, level, created_at, company,
          leader:users!clusters_leader_fkey(
            id, name, surname
          ),
          team_clusters(
            id,
            team:teams(
              id,
              name,
              leader:users(id, name, surname)
            )
          )
        `)
        .single()
      if (error) throw error
      return {
        ...data,
        team_count: data.team_clusters?.length || 0
      }
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('clusters')
        .delete()
        .eq('id', id)
      if (error) throw error
    }
  }
}
