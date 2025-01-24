'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { TeamFormData } from "@/lib/types/teams"
import { mockTeamsApi } from "@/lib/data/mock-teams"
import { mockUsers } from "@/lib/data/mock-users"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateTeamDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: TeamFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!data.name?.trim()) {
        throw new Error('Il nome del team è obbligatorio')
      }

      mockTeamsApi.create({
        name: data.name.trim(),
        leader: data.leaderId ? mockUsers.find(u => u.id === data.leaderId) || null : null,
        isclusterleader: data.isclusterleader || false,
        project: data.project || false,
        team_clusters: data.clusterId ? [{
          id: crypto.randomUUID(),
          cluster: {
            id: data.clusterId,
            name: data.clusterId === 'cluster1' ? 'Cluster Marketing' :
                  data.clusterId === 'cluster2' ? 'Cluster Operations' :
                  'Cluster Development'
          }
        }] : [],
        user_teams: []
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crea Team</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <TeamForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
