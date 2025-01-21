'use client'

import { useState, useEffect } from 'react'
import { PreSessionFeedbacksTable } from './pre-session-feedbacks-table'
import { GenerateFeedbackDialog } from './dialogs/generate-feedback-dialog'
import { Button } from '@/components/ui/button'
import { mockRules, mockSessionsApi } from '@/lib/data/mock-sessions'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { SessionStatus } from '@/app/(routes)/admin/pre-session-analysis/page'
import type { Session } from '@/lib/types/sessions'

interface PreSessionAnalysisViewProps {
  sessionId: string
  sessionStatus: SessionStatus
}

export const PreSessionAnalysisView = ({ sessionId, sessionStatus }: PreSessionAnalysisViewProps) => {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  // Carica i dati della sessione
  useEffect(() => {
    const currentSession = mockSessionsApi.getAll().find(s => s.id === sessionId)
    setSession(currentSession || null)
  }, [sessionId])

  const handleGenerateSuccess = async (ruleId: string) => {
    try {
      // Verifica che la sessione sia ancora in preparazione
      const currentSession = mockSessionsApi.getAll().find(s => s.id === sessionId)
      if (!currentSession || currentSession.stato !== 'In preparazione') {
        toast.error('La sessione non è più in preparazione')
        return
      }

      const updatedSession = await mockSessionsApi.generateFeedback(sessionId, ruleId)
      setSession(updatedSession)
      toast.success('Feedback generati con successo')
    } catch (error) {
      console.error('Errore durante la generazione:', error)
      toast.error(error instanceof Error ? error.message : 'Errore durante la generazione dei feedback')
    }
  }

  // Se non c'è una sessione, non mostrare nulla
  if (!session) return null

  const canGenerateFeedback = session.stato === 'In preparazione'

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Feedback della sessione</p>
          {canGenerateFeedback && (
            <Button
              onClick={() => setIsGenerateOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Genera
            </Button>
          )}
        </div>
        {session.generatedRules && session.generatedRules.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-sm font-medium">Regole generate:</span>
            <div className="flex flex-wrap gap-2">
              {session.generatedRules.map(ruleId => {
                const rule = mockRules.find(r => r.id === ruleId)
                return rule ? (
                  <Badge key={rule.id} variant="secondary">
                    {rule.name}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <PreSessionFeedbacksTable 
          sessionStatus={sessionStatus}
        />
      </div>

      <GenerateFeedbackDialog
        sessionId={sessionId}
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onSuccess={handleGenerateSuccess}
        generatedRules={session.generatedRules || []}
      />
    </div>
  )
} 