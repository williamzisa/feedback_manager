import type { Database } from "../supabase/database.types"

export interface Team {
  id: string
  name: string
  company: string | null
  created_at: string | null
  isclusterleader: boolean | null
  project: boolean | null
  leader?: {
    id: string
    name: string
    surname: string
  } | null
  team_clusters?: {
    cluster?: {
      id: string
      name: string
    } | null
  }[]
  user_teams?: {
    id: string
    user_id: string | null
    team_id: string | null
    created_at: string | null
  }[]
}

export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export interface TeamFormData {
  name: string
  clusterId: string | null
  leaderId: string | null
  isclusterleader: boolean
  project: boolean
}
