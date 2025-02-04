/**
 * Tipi specifici per il modulo di Feedback Management
 */

import { BaseFeedback, FeedbackType } from './feedback.types';

// Tipo per l'utente nei feedback
export interface FeedbackUser {
  id: string;
  name: string;
  surname: string;
}

// Tipo per la domanda nei feedback
export interface FeedbackQuestion {
  id: string;
  description: string;
  type: FeedbackType;
}

// Tipo specifico per i feedback nel management
export type ManagementFeedback = BaseFeedback & {
  sender: FeedbackUser;
  receiver: FeedbackUser;
  question: FeedbackQuestion;
}

// Tipo per i filtri del feedback management
export interface FeedbackManagementFilters {
  sender: string;
  receiver: string;
  type: FeedbackType | 'all';
  responseStatus: 'all' | 'with_response' | 'without_response';
}

// Tipo per le statistiche del feedback management
export interface FeedbackManagementStats {
  totalResponses: number;
  responseRate: number;
  averageScore: number;
  feedbacksByType: Record<FeedbackType, number>;
} 