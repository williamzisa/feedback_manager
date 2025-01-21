'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TeamsTable } from './teams-table'
import { CreateTeamDialog } from './dialogs/create-team-dialog'
import { EditTeamDialog } from './dialogs/edit-team-dialog'
import type { Team } from '@/lib/types/teams'

interface TeamsViewProps {
  teams: Team[]
  onSuccess: () => void
}

export function TeamsView({ teams, onSuccess }: TeamsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.leader?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.leader?.surname?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSuccess = () => {
    console.log('Operation successful, calling onSuccess')
    onSuccess()
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="search"
            placeholder="Cerca Team"
            className="w-full bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={() => setIsCreateOpen(true)}
        >
          Nuovo Team
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">{filteredTeams.length} risultati</p>
        </div>
        <div className="p-4">
          <TeamsTable 
            teams={filteredTeams} 
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      <CreateTeamDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSuccess}
      />

      <EditTeamDialog
        team={selectedTeam}
        open={!!selectedTeam}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
