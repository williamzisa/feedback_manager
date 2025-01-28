import { Database } from '../supabase/database.types'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'

export type Session = Database['public']['Tables']['sessions']['Row'] & {
  session_clusters?: {
    id: string
    cluster: {
      id: string
      name: string
    }
  }[]
  session_rules?: {
    id: string
    rule: {
      id: string
      name: string
    }
  }[]
}

export type RefetchFunction = (options?: RefetchOptions) => Promise<QueryObserverResult<Session[], Error>>

export interface EditSessionDialogProps {
  session: Session
  onSuccess: RefetchFunction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface CreateSessionDialogProps {
  onSuccess: RefetchFunction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface SessionFormData {
  name: string
  start_time: string | null
  end_time: string | null
  clusters: string[]
  rules: string[]
  status?: string
}

export type SessionStatus = 'In preparazione' | 'In corso' | 'Conclusa' 