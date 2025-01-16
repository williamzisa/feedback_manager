'use client'

import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"
import { StatCard } from '@/components/stats/stat-card'
import { ClustersView } from "@/components/clusters/clusters-view"

export default function ClustersPage() {
  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters'],
    queryFn: queries.clusters.getAll
  })

  // Calcola le statistiche
  const totalClusters = clusters.length
  const level1Clusters = clusters.filter(c => c.level === 1).length
  const level2Clusters = clusters.filter(c => c.level === 2).length
  const level3Clusters = clusters.filter(c => c.level === 3).length

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
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Clusters</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="N.CLUSTERS" value={totalClusters} />
          <StatCard title="LIVELLO 1" value={level1Clusters} className="bg-blue-100" />
          <StatCard title="LIVELLO 2" value={level2Clusters} className="bg-green-100" />
          <StatCard title="LIVELLO 3" value={level3Clusters} className="bg-yellow-100" />
        </div>

        {/* Clusters View */}
        <ClustersView clusters={clusters} />
      </main>
    </div>
  )
}
