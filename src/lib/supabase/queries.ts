import { supabase } from './config'

export const queries = {
  // Users
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
      if (error) throw error
      return data
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
  },

  // Teams
  teams: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
      if (error) throw error
      return data
    }
  },

  // User Teams (previously Memberships)
  user_teams: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('user_teams')
        .select('*, users(*), teams(*)')
      if (error) throw error
      return data
    }
  },

  // Clusters
  clusters: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('clusters')
        .select(`
          id,
          name,
          level,
          leader:users!clusters_leader_fkey (
            id,
            name,
            surname
          ),
          team_clusters (
            id
          )
        `)
      if (error) {
        console.error('Error fetching clusters:', error)
        throw new Error(error.message)
      }
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
          leader: cluster.leaderId === 'none' ? null : cluster.leaderId
        }])
        .select(`
          id,
          name,
          level,
          leader:users!clusters_leader_fkey (
            id,
            name,
            surname
          )
        `)
        .single()

      if (error) {
        console.error('Error creating cluster:', error)
        throw new Error(error.message)
      }

      return data
    },

    update: async (id: string, cluster: { name: string; level: number | null; leaderId: string | null }) => {
      const { data, error } = await supabase
        .from('clusters')
        .update({
          name: cluster.name,
          level: cluster.level,
          leader: cluster.leaderId === 'none' ? null : cluster.leaderId
        })
        .eq('id', id)
        .select(`
          id,
          name,
          level,
          leader:users!clusters_leader_fkey (
            id,
            name,
            surname
          )
        `)
        .single()

      if (error) {
        console.error('Error updating cluster:', error)
        throw new Error(error.message)
      }

      return data
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('clusters')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting cluster:', error)
        throw new Error(error.message)
      }
    }
  }

  // Aggiungi altre query qui per le altre tabelle
}
