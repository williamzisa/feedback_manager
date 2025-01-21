export interface Team {
  id: string
  name: string
  project: boolean
  isclusterleader: boolean
  leader: { id: string; name: string; surname: string } | null
  team_clusters: Array<{ id: string; cluster: { id: string; name: string } }>
  user_teams: Array<{ id: string; user_id: string; team_id: string; created_at: string }>
}

export interface TeamFormData {
  name: string
  project: boolean
  isclusterleader: boolean
  leaderId?: string | null
  clusterId?: string | null
}

/* 
  Questi tipi verranno utilizzati quando integreremo Supabase
  Per ora li teniamo commentati per evitare errori di ESLint

  import type { Database } from "../supabase/database.types"
  export type TeamInsert = Database['public']['Tables']['teams']['Insert']
  export type TeamUpdate = Database['public']['Tables']['teams']['Update']
*/
