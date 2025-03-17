'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProcessForm } from "../forms/process-form"
import type { Process, ProcessFormData } from "@/lib/types/processes"
import { queries } from "@/lib/supabase/queries"

interface EditProcessDialogProps {
  process: Process | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditProcessDialog({
  process,
  open,
  onOpenChange,
  onSuccess
}: EditProcessDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ProcessFormData) => {
    try {
      if (!process) return
      
      setIsLoading(true)
      setError(null)

      await queries.processes.update(process.id, {
        name: data.name.trim(),
        linked_question_id: data.linked_question_id
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento del processo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!process) return
      
      setIsLoading(true)
      setError(null)

      await queries.processes.delete(process.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del processo')
    } finally {
      setIsLoading(false)
    }
  }

  if (!process) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifica Processo</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <ProcessForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            initialData={process}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 