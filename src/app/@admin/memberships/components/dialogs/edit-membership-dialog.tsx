'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MembershipForm } from "../forms/membership-form"
import type { UserTeam, UserTeamFormData } from "@/lib/types/memberships"
import { queries } from "@/lib/supabase/queries"

interface EditMembershipDialogProps {
  membership: UserTeam | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditMembershipDialog({
  membership,
  open,
  onOpenChange,
  onSuccess
}: EditMembershipDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: UserTeamFormData) => {
    try {
      if (!membership) return
      
      setIsLoading(true)
      setError(null)

      await queries.userTeams.update(membership.id, {
        userId: data.userId,
        teamId: data.teamId
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating membership:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento della membership')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!membership) return
      
      setIsLoading(true)
      setError(null)

      await queries.userTeams.delete(membership.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting membership:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione della membership')
    } finally {
      setIsLoading(false)
    }
  }

  if (!membership || !membership.user_id || !membership.team_id) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Membership</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <MembershipForm
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isLoading={isLoading}
          mode="edit"
          initialData={{
            userId: membership.user_id,
            teamId: membership.team_id
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
