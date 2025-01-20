import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

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
            <TableHead className="text-right"></TableHead>
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
