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
      if (!data.role?.trim()) {
        throw new Error('Il ruolo è obbligatorio')
      }
      if (typeof data.step !== 'number') {
        throw new Error('Lo step deve essere un numero')
      }
      if (typeof data.standard !== 'number') {
        throw new Error('Lo standard deve essere un numero')
      }

      // Validazione delle percentuali
      const total = Number(data.execution_weight) + Number(data.soft_weight) + Number(data.strategy_weight)
      if (total !== 100) {
        throw new Error('La somma delle percentuali deve essere 100%')
      }

      const levelData = {
        role: data.role.trim(),
        step: data.step,
        execution_weight: Number(data.execution_weight),
        soft_weight: Number(data.soft_weight),
        strategy_weight: Number(data.strategy_weight),
        standard: data.standard,
        company: "00000000-0000-0000-0000-000000000000" // TODO: ottenere la company dall'utente corrente
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