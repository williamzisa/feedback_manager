'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { Team, TeamFormData } from "@/lib/types/teams"
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
      
      if (!data.name.trim()) {
        throw new Error('Il nome del team è obbligatorio')
      }

      const teamData = {
        name: data.name.trim(),
        leader: data.leaderId === 'none' ? null : data.leaderId,
        isclusterleader: data.isclusterleader || null,
        project: data.project || null
      }

      console.log('Team data to update:', teamData)

      // 1. Update team
      const updatedTeam = await queries.teams.update(team.id, teamData)
      console.log('Updated team:', updatedTeam)

      // 2. Update team_clusters relation
      const currentClusterId = team.team_clusters?.[0]?.cluster?.id
      const newClusterId = data.clusterId === 'none' ? null : data.clusterId

      if (currentClusterId !== newClusterId) {
        // Remove old relation if exists
        if (currentClusterId) {
          await queries.team_clusters.deleteByTeamId(team.id)
        }
        // Create new relation if cluster selected
        if (newClusterId) {
          await queries.team_clusters.create({
            team_id: team.id,
            cluster_id: newClusterId
          })
        }
      }

      // 3. Update user_teams relation for leader
      const currentLeaderId = team.leader?.id
      const newLeaderId = data.leaderId === 'none' ? null : data.leaderId

      if (currentLeaderId !== newLeaderId) {
        // Remove old leader if exists
        if (currentLeaderId) {
          await queries.user_teams.deleteByUserAndTeam(currentLeaderId, team.id)
        }
        // Add new leader if selected
        if (newLeaderId) {
          await queries.user_teams.create({
            team_id: team.id,
            user_id: newLeaderId
          })
        }
      }
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating team:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento del team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questo team?')) return
    
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
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        <TeamForm 
          initialData={{
            name: team.name,
            leaderId: team.leader?.id || 'none',
            clusterId: team.team_clusters?.[0]?.cluster?.id || 'none',
            isclusterleader: team.isclusterleader || false,
            project: team.project || false
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}
