import { Database } from '../supabase/database.types'

export interface QuestionTag {
  id: string
  score: number
  description: string
}

export interface Question {
  id: string
  description: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
  created_at: string
  company: string
  tags_count?: number
}

export type QuestionInsert = Database['public']['Tables']['questions']['Insert']
export type QuestionUpdate = Database['public']['Tables']['questions']['Update']

export interface QuestionFormData {
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
}

export interface QuestionTagFormData {
  score: number
  description: string
}