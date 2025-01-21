import type { Database } from "../supabase/database.types"

export interface Team {
  id: string
  name: string
  project: boolean
  isclusterleader: boolean
}

export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export interface TeamFormData {
  name: string
  project: boolean
  isclusterleader: boolean
}
