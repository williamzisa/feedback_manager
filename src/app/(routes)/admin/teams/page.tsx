'use client'

import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"
import { StatCard } from '@/components/stats/stat-card'
import { TeamsView } from "@/components/teams/teams-view"

export default function TeamsPage() {
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: queries.teams.getAll
  })

  // Calcola le statistiche
  const totalTeams = teams.length
  const marketingTeams = 0 // teams.filter(t => t.type === 'MARKETING').length
  const operationsTeams = 0 // teams.filter(t => t.type === 'OPERATIONS').length
  const developmentTeams = 0 // teams.filter(t => t.type === 'DEVELOPMENT').length

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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Teams</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="N.TEAMS" value={totalTeams} />
          <StatCard title="MARKETING" value={marketingTeams} className="bg-blue-100" />
          <StatCard title="OPERATIONS" value={operationsTeams} className="bg-green-100" />
          <StatCard title="DEVELOPMENT" value={developmentTeams} className="bg-yellow-100" />
        </div>

        {/* Teams View */}
        <TeamsView />
      </main>
    </div>
  )
}
