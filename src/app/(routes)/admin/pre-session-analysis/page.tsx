'use client'

import { useState } from 'react'
import { StatCard } from '@/components/stats/stat-card'
import { PreSessionAnalysisView } from "@/components/pre-session-analysis/pre-session-analysis-view"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PreSessionStats } from '@/lib/types/feedbacks'
import { Button } from '@/components/ui/button'

export type SessionStatus = 'preparation' | 'in_progress' | 'completed'

export default function PreSessionAnalysisPage() {
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('preparation')

  // Statistiche statiche (da implementare con i dati reali)
  const stats: PreSessionStats = {
    totalFeedbacks: 2365,
    avgFeedbacksPerUser: 38.7,
    usersWithNoFeedbacks: 33,
    totalUsers: 61
  }

  const handleSessionChange = (value: string) => {
    setSelectedSession(value)
    // Per test: imposta lo stato in base alla sessione selezionata
    if (value === '1') {
      setSessionStatus('in_progress')
    } else if (value === '2') {
      setSessionStatus('preparation')
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
            <Select value={selectedSession} onValueChange={handleSessionChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleziona una sessione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sessione in corso</SelectItem>
                <SelectItem value="2">Sessione in preparazione</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end flex-1">
            {selectedSession && sessionStatus === 'preparation' && (
              <Button className="bg-blue-500 hover:bg-blue-600">
                GENERA
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="FEEDBACK GENERATI" value={stats.totalFeedbacks} />
          <StatCard title="AVG FEEDBACKS PER UTENTE" value={stats.avgFeedbacksPerUser} className="bg-green-100" />
          <StatCard title="UTENTI CON 0 FEEDBACKS" value={stats.usersWithNoFeedbacks} className="bg-gray-100" />
          <StatCard title="UTENTI TOTALI SESSIONE" value={stats.totalUsers} className="bg-green-100" />
        </div>

        {/* Pre Session Analysis View */}
        <PreSessionAnalysisView sessionStatus={sessionStatus} />
      </main>
    </div>
  )
} 