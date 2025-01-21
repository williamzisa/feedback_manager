'use client'

import { PreSessionFeedbacksTable } from './pre-session-feedbacks-table'
import type { SessionStatus } from '@/app/(routes)/admin/pre-session-analysis/page'

interface PreSessionAnalysisViewProps {
  sessionStatus: SessionStatus
}

export const PreSessionAnalysisView = ({ sessionStatus }: PreSessionAnalysisViewProps) => {
  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <p className="text-sm text-gray-500">Feedback della sessione</p>
      </div>
      
      <div className="p-4">
        <PreSessionFeedbacksTable sessionStatus={sessionStatus} />
      </div>
    </div>
  )
} 