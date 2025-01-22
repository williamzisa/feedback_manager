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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || question.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <>
      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Cerca Domanda"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-4">
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
        </div>
        <div className="p-4">
          <QuestionsTable 
            questions={filteredQuestions}
            onEdit={async (id) => {
              const question = questions.find(q => q.id === id)
              if (question) {
                setEditQuestion(question)
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
          onDelete={async () => {
            if (editQuestion) {
              const success = await onDelete(editQuestion.id)
              if (success) {
                setEditQuestion(null)
              }
            }
          }}
          onClose={() => setEditQuestion(null)}
        />
      )}
    </>
  )
}