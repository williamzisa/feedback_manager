'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QuestionsTable } from './questions-table'
import type { Question, QuestionFormData } from '@/lib/types/questions'
import { CreateQuestionDialog } from './dialogs/create-question-dialog'
import { EditQuestionDialog } from './dialogs/edit-question-dialog'
import { DeleteQuestionDialog } from './dialogs/delete-question-dialog'

export interface QuestionsViewProps {
  questions: Question[]
  onCreate: (data: QuestionFormData) => Promise<boolean>
  onEdit: (id: string, data: QuestionFormData) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}

export function QuestionsView({ questions, onCreate, onEdit, onDelete }: QuestionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<Question['type'] | 'ALL'>('ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null)

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || question.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="search"
            placeholder="Cerca Domanda"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as Question['type'] | 'ALL')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tutti i tipi</SelectItem>
              <SelectItem value="SOFT">Soft</SelectItem>
              <SelectItem value="STRATEGY">Strategy</SelectItem>
              <SelectItem value="EXECUTION">Execution</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateOpen(true)}>
            Nuova Domanda
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Lista delle domande</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              Nuova Domanda
            </Button>
          </div>
        </div>
        <div className="p-4">
          <QuestionsTable 
            questions={filteredQuestions}
            onEdit={(id) => {
              const question = questions.find(q => q.id === id)
              if (question) {
                setEditQuestion(question)
              }
            }}
            onDelete={(id) => {
              const question = questions.find(q => q.id === id)
              if (question) {
                setDeleteQuestion(question)
              }
            }}
          />
        </div>
      </div>

      <CreateQuestionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={onCreate}
      />

      {editQuestion && (
        <EditQuestionDialog
          question={editQuestion}
          onEdit={async (data) => {
            const success = await onEdit(editQuestion.id, data)
            if (success) {
              setEditQuestion(null)
            }
          }}
          onDelete={() => setEditQuestion(null)}
        />
      )}

      {deleteQuestion && (
        <DeleteQuestionDialog
          question={deleteQuestion}
          open={true}
          onOpenChange={(open) => !open && setDeleteQuestion(null)}
          onConfirm={async () => {
            const success = await onDelete(deleteQuestion.id)
            if (success) {
              setDeleteQuestion(null)
            }
            return success
          }}
        />
      )}
    </>
  )
}