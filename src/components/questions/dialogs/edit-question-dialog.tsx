'use client'

import { useState, useEffect } from "react"
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
import { Question, QuestionFormData } from "@/lib/types/questions"
import { Loader2 } from "lucide-react"

interface EditQuestionDialogProps {
  question: Question
  onEdit: (data: QuestionFormData) => void
  onDelete: () => void
}

export function EditQuestionDialog({
  question,
  onEdit,
  onDelete
}: EditQuestionDialogProps) {
  const [text, setText] = useState(question.text)
  const [type, setType] = useState(question.type)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (question) {
      setText(question.text)
      setType(question.type)
    }
  }, [question])

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Il testo della domanda è obbligatorio")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      onEdit({ text, type })
    } catch {
      setError("Errore durante la modifica della domanda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onDelete}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Domanda</DialogTitle>
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
              onClick={onDelete}
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
                  Salvataggio...
                </>
              ) : (
                'Salva'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}