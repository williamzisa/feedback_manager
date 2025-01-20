import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import QuestionForm from '../forms/question-form'
import { Question } from '@/lib/types/questions'

interface EditQuestionDialogProps {
  question: Question
  onEdit: (data: Question) => void
  onDelete: () => void
}

export function EditQuestionDialog({ question, onEdit, onDelete }: EditQuestionDialogProps) {
  const [open, setOpen] = useState<boolean>(false)

  const handleEdit = async (data: { text: string; type: 'SOFT' | 'STRATEGY' | 'EXECUTION' }) => {
    try {
      await onEdit({
        ...data,
        id: question.id,
        created_at: question.created_at,
        company: question.company
      })
      setOpen(false)
    } catch (error) {
      console.error('Error editing question:', error)
    }
  }

  const handleDelete = () => {
    onDelete()
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Domanda</DialogTitle>
        </DialogHeader>
        <QuestionForm
          defaultValues={question}
          onSubmit={handleEdit}
          onDelete={handleDelete}
        />
      </DialogContent>
    </Dialog>
  )
}