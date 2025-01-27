'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { TeamFormData } from "@/lib/types/teams"
import { queries } from "@/lib/supabase/queries"

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

      if (!data.leaderId) {
        throw new Error('Il team leader è obbligatorio')
      }

      // Otteniamo la company dell'utente corrente
      const currentUser = await queries.users.getCurrentUser();
      
      if (!currentUser.company) {
        throw new Error('Errore: account non configurato correttamente (company mancante)');
      }

      // Creiamo il team con la company dell'utente
      const teamResponse = await queries.teams.create({
        name: data.name.trim(),
        leaderId: data.leaderId,
        is_project: data.project,
        company: currentUser.company
      });

      if (!teamResponse?.id) {
        throw new Error('Errore nella creazione del team')
      }

      // Se abbiamo un cluster, lo associamo al team
      if (data.clusterId) {
        await queries.team_clusters.create({
          team_id: teamResponse.id,
          cluster_id: data.clusterId
        });
      }
      
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Errore durante la creazione del team:', err)
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
