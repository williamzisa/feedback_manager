import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import type { Process } from '@/lib/types/processes'

interface ProcessesTableProps {
  processes: Process[]
  onEdit: (process: Process) => void
}

export function ProcessesTable({ processes, onEdit }: ProcessesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PROCESSO</TableHead>
            <TableHead>DOMANDA COLLEGATA</TableHead>
            <TableHead className="text-center">N. UTENTI</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell className="font-medium">{process.name}</TableCell>
              <TableCell>{process.linked_question?.description || '-'}</TableCell>
              <TableCell className="text-center">{process.user_count}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(process)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
