'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QuestionFormData } from "@/lib/types/questions"
import { Loader2 } from "lucide-react"

interface CreateQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: QuestionFormData) => Promise<boolean>
}

export function CreateQuestionDialog({
  open,
  onOpenChange,
  onSubmit
}: CreateQuestionDialogProps) {
  const [text, setText] = useState("")
  const [type, setType] = useState<"SOFT" | "STRATEGY" | "EXECUTION">("SOFT")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Inserisci il testo della domanda")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const success = await onSubmit({ text, type })
      if (success) {
        setText("")
        setType("SOFT")
        onOpenChange(false)
      }
    } catch {
      setError("Errore durante la creazione della domanda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuova Domanda</DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              placeholder="Testo della domanda"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Select
              value={type}
              onValueChange={(value) => setType(value as "SOFT" | "STRATEGY" | "EXECUTION")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOFT">Soft</SelectItem>
                <SelectItem value="STRATEGY">Strategy</SelectItem>
                <SelectItem value="EXECUTION">Execution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creazione...
                </>
              ) : (
                'Crea'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}