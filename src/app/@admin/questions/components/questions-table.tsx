import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { Question } from '@/lib/types/questions'

interface QuestionsTableProps {
  questions: Question[]
  onEdit: (id: string) => Promise<void>
}

export function QuestionsTable({ questions, onEdit }: QuestionsTableProps) {
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
            <TableHead className="hidden sm:table-cell">ID</TableHead>
            <TableHead>Question</TableHead>
            <TableHead className="hidden md:table-cell">TYPE</TableHead>
            <TableHead className="hidden lg:table-cell">Created At</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <TableRow key={question.id}>
              <TableCell className="hidden sm:table-cell">{index + 1}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium max-w-2xl">{question.description}</div>
                  {/* Info aggiuntive visibili solo su mobile */}
                  <div className="md:hidden space-y-1 text-sm text-gray-500">
                    <div>ID: {index + 1}</div>
                    <div>
                      <span className={`font-medium ${getTypeColor(question.type)}`}>
                        {question.type}
                      </span>
                    </div>
                    <div>
                      {new Date(question.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`font-medium ${getTypeColor(question.type)}`}>
                  {question.type}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {new Date(question.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(question.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!questions || questions.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Nessuna domanda trovata
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
