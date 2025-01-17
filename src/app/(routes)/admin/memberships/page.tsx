'use client'

import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"
import { StatCard } from '@/components/stats/stat-card'
import { MembershipsView } from "@/components/memberships/memberships-view"
import type { Membership } from "@/lib/types/memberships"

export default function MembershipsPage() {
  const { data: memberships = [] } = useQuery<Membership[]>({
    queryKey: ['memberships'],
    queryFn: queries.user_teams.getAll
  })

  // Calcola le statistiche
  const totalMemberships = memberships.length
  const activeTeams = new Set(memberships.map(m => m.team_id)).size
  const activeUsers = new Set(memberships.map(m => m.user_id)).size

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
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Memberships</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard title="TOTALE MEMBERSHIP" value={totalMemberships} />
          <StatCard title="TEAM ATTIVI" value={activeTeams} className="bg-blue-100" />
          <StatCard title="UTENTI ATTIVI" value={activeUsers} className="bg-green-100" />
        </div>

        <MembershipsView memberships={memberships} />
      </main>
    </div>
  )
}
