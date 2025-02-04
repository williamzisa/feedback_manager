/**
 * Tipi base condivisi per i feedback
 * Questi tipi sono utilizzati sia dal modulo pre-session che da feedback-management
 */

// Tipo base per un feedback
export type BaseFeedback = {
  id: string;
  value: number | null;
  comment: string | null;
  session_id: string;
  rule_number: number | null;
}

// Tipo per le statistiche dei feedback
export interface FeedbackStats {
  totalFeedbacks: number;
  duplicateFeedbacks: number;
  usersWithNoFeedbacks: number;
  totalUsers: number;
  avgFeedbacksPerUser: number;
  usersWithNoFeedbacksDetails?: { 
    name: string; 
    surname: string 
  }[];
}

// Enums condivisi
export enum FeedbackType {
  SOFT = 'SOFT',
  EXECUTION = 'EXECUTION',
  STRATEGY = 'STRATEGY'
}

export enum SessionStatus {
  PREPARATION = 'In preparazione',
  ACTIVE = 'In corso',
  COMPLETED = 'Conclusa'
}

// Tipo per il filtro delle risposte
export type FeedbackResponseFilter = 'all' | 'with_response' | 'without_response'; 