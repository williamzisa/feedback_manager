'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Question } from "@/lib/types/questions"
import { Loader2 } from "lucide-react"

interface DeleteQuestionDialogProps {
  question: Question | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<boolean>
}

export function DeleteQuestionDialog({
  question,
  open,
  onOpenChange,
  onConfirm
}: DeleteQuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const success = await onConfirm()
      if (success) {
        onOpenChange(false)
      }
    } catch {
      setError("Errore durante l'eliminazione della domanda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Elimina Domanda</DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Sei sicuro di voler eliminare questa domanda?
            <br />
            <span className="font-medium text-gray-900">{question?.text}</span>
          </p>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                'Elimina'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 