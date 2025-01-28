'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SessionForm } from "../forms/session-form"
import type { EditSessionDialogProps, SessionFormData } from "@/lib/types/sessions"
import { queries } from "@/lib/supabase/queries"

export function EditSessionDialog({ session, onSuccess, open, onOpenChange }: EditSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Sessione</DialogTitle>
        </DialogHeader>
        <SessionForm 
          initialData={session}
          readOnlyFields={session.status !== 'In preparazione' ? ['clusters', 'rules'] : []}
          onSubmit={async (data: SessionFormData) => {
            await queries.sessions.update(session.id, {
              ...data,
              status: session.status,
              // Se la sessione non è in preparazione, manteniamo i cluster e le regole esistenti
              ...(session.status !== 'In preparazione' && {
                clusters: session.session_clusters?.map(sc => sc.cluster.id) || [],
                rules: session.session_rules?.map(sr => sr.rule.id) || []
              })
            })
            await onSuccess()
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
} 