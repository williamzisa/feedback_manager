'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Question, QuestionFormData } from "@/lib/types/questions"
import QuestionForm from "../forms/question-form"

interface EditQuestionDialogProps {
  question: Question
  onEdit: (data: QuestionFormData) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
}

export function EditQuestionDialog({
  question,
  onEdit,
  onDelete,
  onClose
}: EditQuestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      setIsLoading(true)
      await onEdit(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDelete()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Domanda</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <QuestionForm
            defaultValues={{
              text: question.text,
              type: question.type
            }}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            mode="edit"
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}