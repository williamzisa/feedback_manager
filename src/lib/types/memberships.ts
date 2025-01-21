// Tipo base per i dati mockati
export interface Membership {
  id: string
  user_id: string
  team_id: string
  role: 'MEMBER' | 'LEADER'
  created_at: string
  user?: {
    name: string
    surname: string
    email: string
  } | null
  team?: {
    name: string
    project: boolean
    isclusterleader: boolean
  } | null
}

// Tipo per il form
export interface MembershipFormData {
  userId: string
  teamId: string
}

// Tipo per la creazione
export interface MembershipCreate {
  user_id: string
  team_id: string
  role: 'MEMBER' | 'LEADER'
}

// Tipo per l'aggiornamento
export interface MembershipUpdate {
  user_id: string
  team_id: string
}

/* 
  Questi tipi verranno utilizzati quando integreremo Supabase
  Per ora li teniamo commentati per evitare errori di ESLint

  import type { Database } from "../supabase/database.types"
  export type MembershipInsert = Database['public']['Tables']['user_teams']['Insert']
  export type MembershipUpdate = Database['public']['Tables']['user_teams']['Update']
*/
