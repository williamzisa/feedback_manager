'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClustersTable } from './clusters-table'
import { CreateClusterDialog } from './dialogs/create-cluster-dialog'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/lib/supabase/queries'
import type { Cluster } from '@/lib/types/clusters'

const getLevelBadgeColor = (level: number | null) => {
  switch (level) {
    case 1:
      return 'bg-blue-100 text-blue-800'
    case 2:
      return 'bg-green-100 text-green-800'
    case 3:
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getLevelName = (level: number | null) => {
  if (!level) return 'Nessun livello'
  return `Livello ${level}`
}

export function ClustersView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: clusters = [], refetch } = useQuery({
    queryKey: ['clusters'],
    queryFn: queries.clusters.getAll
  })

  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cluster.leader && `${cluster.leader.name} ${cluster.leader.surname}`.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <Input
          placeholder="Cerca Clusters"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white w-full sm:w-96"
        />
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          <svg
            className="mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuovo Cluster
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">{filteredClusters.length} risultati</p>
        </div>
        
        <div className="p-4 overflow-x-auto">
          {/* Vista Mobile */}
          <div className="block sm:hidden space-y-4">
            {filteredClusters.map((cluster) => (
              <div key={cluster.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{cluster.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${getLevelBadgeColor(cluster.level)}`}>
                    {getLevelName(cluster.level)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="w-24">Leader:</span>
                    {cluster.leader 
                      ? `${cluster.leader.name} ${cluster.leader.surname}`
                      : '-'}
                  </p>
                  <p className="flex items-center">
                    <span className="w-24">Teams:</span>
                    {cluster.team_count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Desktop */}
          <div className="hidden sm:block">
            <ClustersTable 
              clusters={filteredClusters} 
              onSuccess={refetch}
            />
          </div>
        </div>
      </div>

      <CreateClusterDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />
    </div>
  )
}
