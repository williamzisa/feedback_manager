import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export interface Question {
  id: number
  domanda: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
}

interface QuestionsTableProps {
  questions: Question[]
}

export function QuestionsTable({ questions }: QuestionsTableProps) {
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
            <TableHead>DOMANDA</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.id}</TableCell>
              <TableCell className="font-medium max-w-2xl">
                {question.domanda}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${getTypeColor(question.type)}`}>
                  {question.type}
                </span>
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
