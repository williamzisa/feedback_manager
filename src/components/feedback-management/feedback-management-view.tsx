import { SessionStatus } from "@/app/(routes)/admin/feedback-management/page"

interface FeedbackManagementViewProps {
  sessionId: string
  sessionStatus: SessionStatus
}

export default function FeedbackManagementView({ sessionId, sessionStatus }: FeedbackManagementViewProps) {
  return (
    <div>
      <p>Session ID: {sessionId}</p>
      <p>Status: {sessionStatus}</p>
    </div>
  )
} 