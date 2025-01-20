import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import QuestionForm from '../forms/question-form'
import { QuestionFormData } from '../forms/question-schema'

interface CreateQuestionDialogProps {
  onCreate: (data: QuestionFormData) => Promise<boolean>
}

export function CreateQuestionDialog({ onCreate }: CreateQuestionDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      const success = await onCreate(data)
      if (success) {
        setOpen(false)
      }
    } catch (error) {
      console.error('Error creating question:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Crea Nuova Domanda</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuova Domanda</DialogTitle>
        </DialogHeader>
        <QuestionForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}