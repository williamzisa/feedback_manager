'use client'

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"
import { Button } from "@/components/ui/button"
import { TeamsTable } from "./teams-table"
import { CreateTeamDialog } from "./dialogs/create-team-dialog"
import { Input } from "@/components/ui/input"

export function TeamsView() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchTeam, setSearchTeam] = useState('')
  const [searchCluster, setSearchCluster] = useState('')

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: queries.teams.getAll
  })

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['teams'] })
  }

  // Filtra i team in base ai criteri di ricerca
  const filteredTeams = teams.filter(team => {
    const matchesTeamName = team.name.toLowerCase().includes(searchTeam.toLowerCase())
    const matchesCluster = searchCluster === '' || 
      team.team_clusters?.some(tc => tc.cluster?.name.toLowerCase().includes(searchCluster.toLowerCase()))
    return matchesTeamName && matchesCluster
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Cerca Teams"
            className="bg-white w-full sm:w-96"
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Cerca Cluster"
            className="bg-white w-full sm:w-96"
            value={searchCluster}
            onChange={(e) => setSearchCluster(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
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
          Nuovo Team
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'risultato' : 'risultati'}
          </p>
        </div>
        <div className="p-4">
          <TeamsTable teams={filteredTeams} onSuccess={handleSuccess} />
        </div>
      </div>

      <CreateTeamDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
