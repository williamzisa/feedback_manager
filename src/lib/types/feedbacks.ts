export type Feedback = {
  id: string
  sender: string
  receiver: string
  question: string
  rule: number
  tags: string[]
  value: number | null
  comment: string | null
  questionType: string
}

export type PreSessionStats = {
  totalFeedbacks: number
  avgFeedbacksPerUser: number
  usersWithNoFeedbacks: number
  totalUsers: number
} 