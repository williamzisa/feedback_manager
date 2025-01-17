import type { Database } from "../supabase/database.types"

export interface Membership {
  id: string
  user_id: string | null
  team_id: string | null
  created_at: string | null
  user?: {
    id: string
    name: string
    surname: string
    email: string
  } | null
  team?: {
    id: string
    name: string
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
  } | null
}

export type MembershipInsert = Database['public']['Tables']['user_teams']['Insert']
export type MembershipUpdate = Database['public']['Tables']['user_teams']['Update']

export interface MembershipFormData {
  userId: string
  teamId: string
}

export interface CreateMembershipData {
  id: string
  user_id: string
  team_id: string
}
