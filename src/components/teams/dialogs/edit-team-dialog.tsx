'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { Team, TeamFormData, TeamUpdate } from "@/lib/types/teams"
import type { CreateMembershipData } from "@/lib/types/memberships"
import { queries } from "@/lib/supabase/queries"

interface EditTeamDialogProps {
  team: Team
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
      setIsLoading(true)
      setError(null)

      if (!data.name?.trim()) {
        throw new Error('Il nome del team è obbligatorio')
      }

      const updateData: TeamUpdate = {
        name: data.name.trim(),
        leader: data.leaderId === 'none' ? null : data.leaderId,
        isclusterleader: data.isclusterleader || null,
        project: data.project || null
      }

      await queries.teams.update(team.id, updateData)

      const currentLeaderId = team.leader?.id
      const newLeaderId = data.leaderId === 'none' ? null : data.leaderId

      if (currentLeaderId !== newLeaderId) {
        if (currentLeaderId) {
          const oldMembership = team.user_teams?.find(ut => ut.user_id === currentLeaderId)
          if (oldMembership?.id) {
            await queries.user_teams.delete(oldMembership.id)
          }
        }

        if (newLeaderId) {
          const membershipData: CreateMembershipData = {
            id: crypto.randomUUID(),
            team_id: team.id,
            user_id: newLeaderId
          }
          await queries.user_teams.create(membershipData)
        }
      }

      // Gestione cluster
      const currentTeamCluster = team.team_clusters?.[0]
      const currentClusterId = currentTeamCluster?.cluster?.id
      const newClusterId = data.clusterId === 'none' ? null : data.clusterId

      if (currentClusterId !== newClusterId) {
        // Rimuovi il cluster esistente
        if (currentTeamCluster) {
          await queries.team_clusters.deleteByTeamId(team.id)
        }

        // Aggiungi il nuovo cluster
        if (newClusterId) {
          await queries.team_clusters.create({
            team_id: team.id,
            cluster_id: newClusterId
          })
        }
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating team:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la modifica del team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await queries.teams.delete(team.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting team:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Team</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <TeamForm
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          mode="edit"
          initialData={{
            name: team.name,
            leaderId: team.leader?.id || 'none',
            clusterId: team.team_clusters?.[0]?.cluster?.id || 'none',
            isclusterleader: team.isclusterleader || false,
            project: team.project || false
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
