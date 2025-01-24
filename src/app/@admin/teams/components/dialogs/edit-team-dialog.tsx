'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { Team, TeamFormData } from "@/lib/types/teams"
import { mockTeamsApi } from "@/lib/data/mock-teams"
import { mockUsers } from "@/lib/data/mock-users"

interface EditTeamDialogProps {
  team: Team | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTeamDialog({
  team,
  open,
  onOpenChange,
  onSuccess
}: EditTeamDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: TeamFormData) => {
    try {
      if (!team) return
      
      setIsLoading(true)
      setError(null)

      console.log('Form data:', data)

      // Troviamo il leader tra gli utenti
      const leader = data.leaderId ? mockUsers.find(u => u.id === data.leaderId) : null

      const updateData: Partial<Team> = {
        name: data.name.trim(),
        leader,
        isclusterleader: data.isclusterleader,
        project: data.project,
      }

      // Aggiorniamo il cluster solo se è stato selezionato
      if (data.clusterId) {
        const clusterName = data.clusterId === 'cluster1' ? 'Cluster Marketing' :
                          data.clusterId === 'cluster2' ? 'Cluster Operations' :
                          'Cluster Development'
        
        updateData.team_clusters = [{
          id: team.team_clusters?.[0]?.id || crypto.randomUUID(),
          cluster: {
            id: data.clusterId,
            name: clusterName
          }
        }]
      }

      console.log('Update data:', updateData)
      
      const updatedTeam = mockTeamsApi.update(team.id, updateData)
      console.log('Team updated:', updatedTeam)
      
      onOpenChange(false)
      if (onSuccess) {
        console.log('Calling onSuccess from EditTeamDialog')
        onSuccess()
      }
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la modifica del team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!team) return
      
      setIsLoading(true)
      setError(null)

      console.log('Deleting team:', team.id)
      mockTeamsApi.delete(team.id)
      console.log('Team deleted')
      
      onOpenChange(false)
      if (onSuccess) {
        console.log('Calling onSuccess from EditTeamDialog after delete')
        onSuccess()
      }
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del team')
    } finally {
      setIsLoading(false)
    }
  }

  if (!team) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Team</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <TeamForm
            initialData={{
              name: team.name,
              clusterId: team.team_clusters?.[0]?.cluster?.id || null,
              leaderId: team.leader?.id || null,
              isclusterleader: team.isclusterleader,
              project: team.project
            }}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
