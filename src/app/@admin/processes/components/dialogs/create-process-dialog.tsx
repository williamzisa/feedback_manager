'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProcessForm } from "../forms/process-form"
import type { ProcessFormData } from "@/lib/types/processes"
import { queries } from "@/lib/supabase/queries"

interface CreateProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateProcessDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateProcessDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ProcessFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      await queries.processes.create({
        name: data.name.trim(),
        linked_question_id: data.linked_question_id
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del processo')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Nuovo Processo</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <ProcessForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 