'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MembershipForm } from "../forms/membership-form"
import type { Membership, MembershipFormData } from "@/lib/types/memberships"
import { mockMembershipsApi } from "@/lib/data/mock-memberships"

interface EditMembershipDialogProps {
  membership: Membership | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditMembershipDialog({
  membership,
  onOpenChange,
  onSuccess
}: EditMembershipDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: MembershipFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!data.userId || !data.teamId) {
        throw new Error('Tutti i campi sono obbligatori')
      }

      if (!membership?.id) {
        throw new Error('ID membership non valido')
      }

      mockMembershipsApi.update(membership.id, {
        user_id: data.userId,
        team_id: data.teamId
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating membership:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la modifica della membership')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!membership?.id) {
        throw new Error('ID membership non valido')
      }

      mockMembershipsApi.delete(membership.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting membership:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione della membership')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={!!membership} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Membership</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        {membership && (
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
        )}
      </DialogContent>
    </Dialog>
  )
}
