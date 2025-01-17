'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeamForm } from "../forms/team-form"
import type { TeamFormData } from "@/lib/types/teams"
import type { CreateMembershipData } from "@/lib/types/memberships"
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

      const teamData = {
        name: data.name.trim(),
        leader: data.leaderId === 'none' ? null : data.leaderId,
        isclusterleader: data.isclusterleader || null,
        project: data.project || null
      }

      const createdTeam = await queries.teams.create(teamData)

      if (data.leaderId && data.leaderId !== 'none') {
        const membershipData: CreateMembershipData = {
          id: crypto.randomUUID(),
          team_id: createdTeam.id,
          user_id: data.leaderId
        }
        await queries.user_teams.create(membershipData)
      }

      if (data.clusterId && data.clusterId !== 'none') {
        await queries.team_clusters.create({
          team_id: createdTeam.id,
          cluster_id: data.clusterId
        })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error creating team:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuovo Team</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <TeamForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  )
}
