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
      
      if (!data.name.trim()) {
        throw new Error('Il nome del team è obbligatorio')
      }

      console.log('Form data:', data)

      const teamData = {
        name: data.name.trim(),
        leader: data.leaderId === 'none' ? null : data.leaderId,
        isclusterleader: data.isclusterleader || null,
        project: data.project || null
      }

      console.log('Team data to create:', teamData)

      // 1. Create team
      const createdTeam = await queries.teams.create(teamData)
      console.log('Created team:', createdTeam)

      // 2. If cluster is selected, create team_clusters relation
      if (data.clusterId && data.clusterId !== 'none') {
        await queries.team_clusters.create({
          team_id: createdTeam.id,
          cluster_id: data.clusterId
        })
      }

      // 3. If leader is selected, create user_teams relation
      if (data.leaderId && data.leaderId !== 'none') {
        await queries.user_teams.create({
          team_id: createdTeam.id,
          user_id: data.leaderId
        })
      }
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error creating team:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'object' && err !== null) {
        console.log('Detailed error:', JSON.stringify(err))
        setError('Errore durante la creazione del team: ' + JSON.stringify(err))
      } else {
        setError('Errore sconosciuto durante la creazione del team')
      }
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
          <div className="text-red-500 text-sm mb-4">
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
