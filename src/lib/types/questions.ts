export interface Question {
  id: string
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
  created_at: string
  company: string | null
}

export interface QuestionFormData {
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
}

export type QuestionInsert = Omit<Question, 'id' | 'created_at'>
export type QuestionUpdate = Partial<QuestionInsert>

/* 
  Questi tipi verranno utilizzati quando integreremo Supabase
  Per ora li teniamo commentati per evitare errori di ESLint

  import { Database } from '../supabase/database.types'
  export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
  export type QuestionUpdate = Database['public']['Tables']['questions']['Update']
*/