'use client'

import { useState } from 'react'
import { StatCard } from '@/components/stats/stat-card'
import { SessionResultsView } from "@/components/session-results/session-results-view"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type SessionStatus = 'preparation' | 'in_progress' | 'completed'

export interface SessionStats {
  totalUsers: number
  avgOverall: number
  avgGap: number
  avgExecution: number
}

export default function SessionResultsPage() {
  const [selectedSession, setSelectedSession] = useState<string>('')

  // Statistiche statiche (da implementare con i dati reali)
  const stats: SessionStats = {
    totalUsers: 61,
    avgOverall: 7.5,
    avgGap: 6.8,
    avgExecution: 7.2
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
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Risultati Sessione</h1>
        </div>

        {/* Session Selector */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="w-full sm:w-96">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleziona una sessione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Sessione 1</SelectItem>
                <SelectItem value="2">Sessione 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="UTENTI TOTALI" value={stats.totalUsers} />
          <StatCard title="MEDIA OVERALL" value={stats.avgOverall} className="bg-blue-100" />
          <StatCard title="MEDIA GAP" value={stats.avgGap} className="bg-green-100" />
          <StatCard title="MEDIA EXECUTION" value={stats.avgExecution} className="bg-yellow-100" />
        </div>

        {/* Session Results View */}
        <SessionResultsView />
      </main>
    </div>
  )
} 