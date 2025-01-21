'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LevelForm } from "../forms/level-form"
import type { LevelFormData } from "@/lib/types/levels"
import { mockLevelsApi } from "@/lib/data/mock-levels"

interface CreateLevelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateLevelDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateLevelDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: LevelFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validazione dei dati
      if (!data.ruolo?.trim()) {
        throw new Error('Il ruolo è obbligatorio')
      }
      if (!data.step?.trim()) {
        throw new Error('Lo step è obbligatorio')
      }
      if (!data.standard?.trim()) {
        throw new Error('Lo standard è obbligatorio')
      }

      // Validazione delle percentuali
      const total = Number(data.execution) + Number(data.soft) + Number(data.strategy)
      if (total !== 100) {
        throw new Error('La somma delle percentuali deve essere 100%')
      }

      const levelData = {
        ruolo: data.ruolo.trim(),
        step: data.step.trim(),
        execution: Number(data.execution),
        soft: Number(data.soft),
        strategy: Number(data.strategy),
        standard: data.standard.trim()
      }

      mockLevelsApi.create(levelData)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del livello')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Crea Livello</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <LevelForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 