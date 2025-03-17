import type { Database } from '../supabase/database.types'

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

export type UserTeam = Database['public']['Tables']['user_teams']['Row'] & {
  users?: {
    id: string
    name: string
    surname: string
    email: string
  } | null
  teams?: {
    id: string
    name: string
  } | null
}

// Tipo per il form
export type UserTeamFormData = {
  userId: string
  teamId: string
}

// Tipo per la creazione
export type UserTeamCreate = {
  userId: string
  teamId: string
}

// Tipo per l'aggiornamento
export type UserTeamUpdate = {
  userId: string
  teamId: string
}

/* 
  Questi tipi verranno utilizzati quando integreremo Supabase
  Per ora li teniamo commentati per evitare errori di ESLint

  import type { Database } from "../supabase/database.types"
  export type MembershipInsert = Database['public']['Tables']['user_teams']['Insert']
  export type MembershipUpdate = Database['public']['Tables']['user_teams']['Update']
*/
