'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LevelForm } from "../forms/level-form"
import type { Level, LevelFormData } from "@/lib/types/levels"
import { queries } from "@/lib/supabase/queries"

interface EditLevelDialogProps {
  level: Level | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLevelDialog({
  level,
  open,
  onOpenChange,
  onSuccess
}: EditLevelDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: LevelFormData) => {
    try {
      if (!level) return
      
      setIsLoading(true)
      setError(null)

      // Validazione delle percentuali
      const total = Number(data.execution_weight) + Number(data.soft_weight) + Number(data.strategy_weight)
      if (total !== 100) {
        throw new Error('La somma delle percentuali deve essere 100%')
      }

      // Convertiamo esplicitamente tutti i valori numerici
      const updateData = {
        role: data.role.trim(),
        step: Number(data.step),
        execution_weight: Number(data.execution_weight),
        soft_weight: Number(data.soft_weight),
        strategy_weight: Number(data.strategy_weight),
        standard: Number(data.standard)
      }

      console.log('Dati da inviare al server:', { id: level.id, updateData })

      await queries.levels.update(level.id, updateData)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore dettagliato:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento del livello')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!level) return
      
      setIsLoading(true)
      setError(null)

      await queries.levels.delete(level.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore dettagliato:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del livello')
    } finally {
      setIsLoading(false)
    }
  }

  if (!level) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifica Livello</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <LevelForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            initialData={level}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 