'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MembershipForm } from "../forms/membership-form"
import type { MembershipFormData } from "@/lib/types/memberships"
import { mockMembershipsApi } from "@/lib/data/mock-memberships"

interface CreateMembershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateMembershipDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateMembershipDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: MembershipFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!data.userId || !data.teamId) {
        throw new Error('Tutti i campi sono obbligatori')
      }

      mockMembershipsApi.create({
        user_id: data.userId,
        team_id: data.teamId
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error creating membership:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione della membership')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuova Membership</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <MembershipForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  )
}
