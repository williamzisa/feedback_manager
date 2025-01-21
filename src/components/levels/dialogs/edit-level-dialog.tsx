'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LevelForm } from "../forms/level-form"
import type { Level, LevelFormData } from "@/lib/types/levels"
import { mockLevelsApi } from "@/lib/data/mock-levels"

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

      const levelData = {
        ruolo: data.ruolo.trim(),
        step: data.step.trim(),
        execution: Number(data.execution),
        soft: Number(data.soft),
        strategy: Number(data.strategy),
        standard: data.standard.trim()
      }

      mockLevelsApi.update(level.id, levelData)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
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

      mockLevelsApi.delete(level.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
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