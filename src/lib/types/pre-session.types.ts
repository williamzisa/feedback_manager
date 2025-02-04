/**
 * Tipi specifici per il modulo di Pre-Session Analysis
 */

import { BaseFeedback, FeedbackType } from './feedback.types';

// Tipo specifico per i feedback nella pre-session
export type PreSessionFeedback = BaseFeedback & {
  sender: string;
  receiver: string;
  question: string;
  questionType: FeedbackType;
  tags: string[];
}

// Tipo per le statistiche specifiche della pre-session
export interface PreSessionAnalysisStats {
  totalPendingFeedbacks: number;
  feedbacksByRule: {
    ruleNumber: number;
    count: number;
  }[];
  feedbacksByType: {
    type: FeedbackType;
    count: number;
  }[];
}

// Tipo per il contesto della pre-session
export interface PreSessionContext {
  sessionId: string;
  currentRule: number | null;
  isGenerating: boolean;
  hasUnsavedChanges: boolean;
} 