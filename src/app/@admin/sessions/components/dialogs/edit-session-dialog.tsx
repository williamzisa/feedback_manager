'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SessionForm } from "../forms/session-form"
import type { Session, SessionFormData } from "@/lib/types/sessions"

interface EditSessionDialogProps {
  session: Session | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SessionFormData) => void
  onDelete: () => void
}

export function EditSessionDialog({
  session,
  open,
  onOpenChange,
  onSubmit,
  onDelete
}: EditSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: SessionFormData) => {
    try {
      if (!session) return
      
      setIsLoading(true)
      setError(null)

      await onSubmit(data)
      onOpenChange(false)
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento della sessione')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!session) return
      
      setIsLoading(true)
      setError(null)

      await onDelete()
      onOpenChange(false)
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione della sessione')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifica Sessione</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <SessionForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            initialData={session}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 