import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface Process {
  processo: string
  nUser: number
  idDomandaCollegata: number
}

interface ProcessesTableProps {
  processes: Process[]
}

export function ProcessesTable({ processes }: ProcessesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PROCESSO</TableHead>
            <TableHead>N.USER</TableHead>
            <TableHead>ID DOMANDA COLLEGATA</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{process.processo}</TableCell>
              <TableCell>{process.nUser}</TableCell>
              <TableCell>{process.idDomandaCollegata}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
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
