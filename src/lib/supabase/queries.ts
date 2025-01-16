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

  // Memberships
  memberships: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('memberships')
        .select('*, users(*), teams(*)')
      if (error) throw error
      return data
    }
  }

  // Aggiungi altre query qui per le altre tabelle
}
