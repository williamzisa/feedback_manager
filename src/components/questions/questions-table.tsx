import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EditQuestionDialog } from './dialogs/edit-question-dialog'
import { Question } from '@/lib/types/questions'

interface QuestionsTableProps {
  questions: Question[]
  onEdit: (id: string, data: { text: string; type: 'SOFT' | 'STRATEGY' | 'EXECUTION' }) => void
  onDelete: (id: string) => void
}

export function QuestionsTable({ questions, onEdit, onDelete }: QuestionsTableProps) {
  const getTypeColor = (type: Question['type']) => {
    switch (type) {
      case 'SOFT':
        return 'text-blue-600'
      case 'STRATEGY':
        return 'text-purple-600'
      case 'EXECUTION':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.id}</TableCell>
              <TableCell className="font-medium max-w-2xl">
                {question.text}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${getTypeColor(question.type)}`}>
                  {question.type}
                </span>
              </TableCell>
              <TableCell>
                {question.company || '-'}
              </TableCell>
              <TableCell>
                {new Date(question.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <EditQuestionDialog
                  question={question}
                  onEdit={(data) => onEdit(question.id, data)}
                  onDelete={() => onDelete(question.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
