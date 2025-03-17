'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SessionForm } from "../forms/session-form"
import type { CreateSessionDialogProps, SessionFormData } from "@/lib/types/sessions"
import { queries } from "@/lib/supabase/queries"

export function CreateSessionDialog({ onSuccess, open, onOpenChange }: CreateSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova Sessione</DialogTitle>
        </DialogHeader>
        <SessionForm 
          onSubmit={async (data: SessionFormData) => {
            await queries.sessions.create({
              ...data,
              status: 'In preparazione'
            })
            await onSuccess()
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
} 