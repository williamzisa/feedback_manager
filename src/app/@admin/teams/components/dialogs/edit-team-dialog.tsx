'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { Team, TeamFormData } from "@/lib/types/teams"
import { queries } from "@/lib/supabase/queries"

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
  const [initialData, setInitialData] = useState<TeamFormData | null>(null)

  useEffect(() => {
    if (team) {
      setInitialData({
        name: team.name,
        clusterId: team.team_clusters?.[0]?.cluster?.id || null,
        leaderId: team.leader?.id || "",
        project: team.is_project
      })
    }
  }, [team])

  const handleSubmit = async (data: TeamFormData) => {
    try {
      if (!team) return
      
      setIsLoading(true)
      setError(null)

      // Prima aggiorniamo il team base
      await queries.teams.update(team.id, {
        name: data.name.trim(),
        leaderId: data.leaderId,
        is_project: data.project
      });

      // Poi gestiamo il cluster
      if (data.clusterId) {
        // Prima rimuoviamo eventuali cluster esistenti
        await queries.team_clusters.deleteByTeamId(team.id);
        
        // Poi aggiungiamo il nuovo cluster
        await queries.team_clusters.create({
          team_id: team.id,
          cluster_id: data.clusterId
        });
      } else {
        // Se non c'è un cluster, rimuoviamo eventuali associazioni esistenti
        await queries.team_clusters.deleteByTeamId(team.id);
      }
      
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Errore durante la modifica del team:', err)
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

      // Prima rimuoviamo le associazioni con i cluster
      await queries.team_clusters.deleteByTeamId(team.id);
      
      // Poi eliminiamo il team
      await queries.teams.delete(team.id);
      
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Errore durante l\'eliminazione del team:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del team')
    } finally {
      setIsLoading(false)
    }
  }

  if (!team || !initialData) return null

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
            initialData={initialData}
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
