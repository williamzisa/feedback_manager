'use client'

import { QuestionsTable } from './questions-table'
import { CreateQuestionDialog } from './dialogs/create-question-dialog'
import { Question } from '@/lib/types/questions'

interface QuestionsViewProps {
  questions: Question[]
  onCreate: (data: { text: string; type: 'SOFT' | 'STRATEGY' | 'EXECUTION' }) => Promise<boolean>
  onEdit: (id: string, data: { text: string; type: 'SOFT' | 'STRATEGY' | 'EXECUTION' }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}
export function QuestionsView({ questions, onCreate, onEdit, onDelete }: QuestionsViewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Lista Domande
        </h2>
        <div>
          <CreateQuestionDialog onCreate={onCreate} />
        </div>
      </div>
      
      <div>
        <QuestionsTable
          questions={questions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}