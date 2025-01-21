'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/stats/stat-card'
import { PreSessionAnalysisView } from "@/components/pre-session-analysis/pre-session-analysis-view"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PreSessionStats } from '@/lib/types/feedbacks'
import { mockSessionsApi } from '@/lib/data/mock-sessions'
import { Badge } from '@/components/ui/badge'

export type SessionStatus = 'preparation' | 'in-progress' | 'completed'

export default function PreSessionAnalysisPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('preparation')
  const sessions = mockSessionsApi.getAll()

  // Seleziona la prima sessione all'avvio
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const firstSession = sessions[0]
      setSelectedSessionId(firstSession.id)
      setSessionStatus(mapSessionStatus(firstSession.stato))
    }
  }, [sessions, selectedSessionId])

  // Statistiche statiche (da implementare con i dati reali)
  const stats: PreSessionStats = {
    totalFeedbacks: 2365,
    avgFeedbacksPerUser: 38.7,
    usersWithNoFeedbacks: 33,
    totalUsers: 61
  }

  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setSelectedSessionId(sessionId)
      setSessionStatus(mapSessionStatus(session.stato))
    }
  }

  const mapSessionStatus = (stato: string): SessionStatus => {
    switch (stato) {
      case 'In preparazione':
        return 'preparation'
      case 'In corso':
        return 'in-progress'
      case 'Conclusa':
        return 'completed'
      default:
        return 'preparation'
    }
  }

  const getStatusBadgeVariant = (status: SessionStatus) => {
    switch (status) {
      case 'preparation':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'completed':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: SessionStatus) => {
    switch (status) {
      case 'preparation':
        return 'In Preparazione'
      case 'in-progress':
        return 'In Corso'
      case 'completed':
        return 'Conclusa'
      default:
        return 'In Preparazione'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Analisi pre Sessione</h1>
        </div>

        {/* Session Selector */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="w-full sm:w-96">
            <Select value={selectedSessionId} onValueChange={handleSessionChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleziona una sessione" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.nomeSessione}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSessionId && (
              <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(sessionStatus)}>
                  {getStatusLabel(sessionStatus)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {selectedSessionId && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard title="FEEDBACK TOTALI" value={stats.totalFeedbacks} />
              <StatCard title="MEDIA PER UTENTE" value={stats.avgFeedbacksPerUser} className="bg-blue-100" />
              <StatCard title="UTENTI SENZA FEEDBACK" value={stats.usersWithNoFeedbacks} className="bg-yellow-100" />
              <StatCard title="UTENTI TOTALI" value={stats.totalUsers} className="bg-green-100" />
            </div>

            <PreSessionAnalysisView 
              sessionId={selectedSessionId}
              sessionStatus={sessionStatus}
            />
          </>
        )}
      </main>
    </div>
  )
} 