export interface Process {
  id: string
  name: string
  linked_question_id: string
  linked_question?: {
    id: string
    description: string
  } | null
  user_count: number
  company: string
  created_at: string
}

export interface ProcessFormData {
  name: string
  linked_question_id: string
} 