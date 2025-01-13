import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface Level {
  categoria: string
  numero: number
  lettera: string
  pesoExecution: string
  pesoSoft: string
  pesoStrategy: string
  standard: number
  nUser: number
}

interface LevelsTableProps {
  levels: Level[]
}

export function LevelsTable({ levels }: LevelsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CATEGORIA</TableHead>
            <TableHead>NUMERO</TableHead>
            <TableHead>LETTERA</TableHead>
            <TableHead>PESO EXECUTION</TableHead>
            <TableHead>PESO SOFT</TableHead>
            <TableHead>PESO STRATEGY</TableHead>
            <TableHead>STANDARD</TableHead>
            <TableHead>N.USER</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((level, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{level.categoria}</TableCell>
              <TableCell>{level.numero}</TableCell>
              <TableCell>{level.lettera}</TableCell>
              <TableCell>{level.pesoExecution}</TableCell>
              <TableCell>{level.pesoSoft}</TableCell>
              <TableCell>{level.pesoStrategy}</TableCell>
              <TableCell>{level.standard}</TableCell>
              <TableCell>{level.nUser}</TableCell>
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
