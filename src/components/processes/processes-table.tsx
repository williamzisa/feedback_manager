import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

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
            <TableHead className="text-right">Actions</TableHead>
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
