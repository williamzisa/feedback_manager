export type FeedbackType = 'EXECUTION' | 'STRATEGY' | 'SOFT';

export type BaseFeedback = {
  id: string;
  value: number | null;
  comment: string | null;
  rule_number: number | null;
}

export type Feedback = BaseFeedback & {
  sender: string;
  receiver: string;
  question: string;
  rule: number;
  tags: string[];
  questionType: string;
}

export interface PreSessionStats {
  totalFeedbacks: number;
  duplicateFeedbacks: number;
  usersWithNoFeedbacks: number;
  totalUsers: number;
  avgFeedbacksPerUser: number;
  usersWithNoFeedbacksDetails?: { name: string; surname: string }[];
}

// Tipo per il contesto della pre-session
export interface PreSessionContext {
  sessionId: string;
  currentRule: number | null;
  isGenerating: boolean;
  hasUnsavedChanges: boolean;
}