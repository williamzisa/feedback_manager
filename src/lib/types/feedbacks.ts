export type Feedback = {
  id: string
  sender: string
  receiver: string
  question: string
  rule: number
  rule_number: number | null
  tags: string[]
  value: number | null
  comment: string | null
  questionType: string
}

export interface PreSessionStats {
  totalFeedbacks: number;
  duplicateFeedbacks: number;
  usersWithNoFeedbacks: number;
  totalUsers: number;
  avgFeedbacksPerUser: number;
  usersWithNoFeedbacksDetails?: { name: string; surname: string }[];
} 