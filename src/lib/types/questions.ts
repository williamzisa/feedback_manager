import { Database } from '../supabase/database.types'

export interface Question {
  id: string
  description: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
  created_at: string
  company: string
}

export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export interface QuestionFormData {
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
}