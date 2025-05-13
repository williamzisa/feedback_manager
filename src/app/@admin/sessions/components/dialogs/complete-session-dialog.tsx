'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { queries } from "@/lib/supabase/queries"
import type { Session, RefetchFunction } from "@/lib/types/sessions"
import { AlertCircle } from "lucide-react"

interface CompleteSessionDialogProps {
  session: Session
  onSuccess: RefetchFunction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompleteSessionDialog({ 
  session, 
  onSuccess, 
  open, 
  onOpenChange 
}: CompleteSessionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      
      console.log("Aggiornamento stato della sessione:", {
        id: session.id,
        status: 'Conclusa'
      });
      
      // Aggiorniamo SOLO lo stato della sessione
      await queries.sessions.updateStatus(session.id, 'Conclusa')
      
      await onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Errore nella conclusione della sessione:', error)
      // Estrai un messaggio più dettagliato dall'errore
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Errore sconosciuto durante la conclusione della sessione')
      } else {
        setErrorMessage('Si è verificato un errore durante la conclusione della sessione')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Concludi Sessione</DialogTitle>
        </DialogHeader>

        <div className="flex items-start space-x-2 my-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium mb-2">
              Stai per concludere la sessione &ldquo;{session.name}&rdquo;
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Conclusa la sessione, verranno calcolati tutti i risultati finali 
              e non sarà più possibile modificare i feedback.
            </p>
            <p className="text-sm text-gray-500">
              Procedere con la conclusione della sessione?
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm mt-2">
            {errorMessage}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleComplete} disabled={isLoading}>
            {isLoading ? 'Elaborazione...' : 'Concludi sessione'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 