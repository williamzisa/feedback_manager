import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Edit } from 'lucide-react'
import QuestionForm from '../forms/question-form'
import { Question } from '@/lib/types/questions'

interface EditQuestionDialogProps {
  question: Question
  onEdit: (data: Question) => void
  onDelete: () => void
}

export function EditQuestionDialog({ question, onEdit, onDelete }: EditQuestionDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = async (data: { text: string; type: 'SOFT' | 'STRATEGY' | 'EXECUTION' }) => {
    try {
      setIsLoading(true)
      setError(null)
      await onEdit({
        ...data,
        id: question.id,
        created_at: question.created_at,
        company: question.company
      })
      setOpen(false)
    } catch (error) {
      console.error('Error editing question:', error)
      setError(error instanceof Error ? error.message : 'Errore durante la modifica della domanda')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onDelete()
      setOpen(false)
    } catch (error) {
      console.error('Error deleting question:', error)
      setError(error instanceof Error ? error.message : 'Errore durante l\'eliminazione della domanda')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Domanda</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <QuestionForm
          defaultValues={question}
          onSubmit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}