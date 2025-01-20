import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

export interface Rule {
  numero: number
  nomeRegola: string
  descrizione: string
  note: boolean
  codiceSQL: 'Apri' | 'Button'
}

interface RulesTableProps {
  rules: Rule[]
}

export function RulesTable({ rules }: RulesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NUMERO</TableHead>
            <TableHead>NOME REGOLA</TableHead>
            <TableHead>Descrizione</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>CODICE SQL</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.numero}>
              <TableCell>{rule.numero}</TableCell>
              <TableCell className="font-medium max-w-md">
                {rule.nomeRegola}
              </TableCell>
              <TableCell className="max-w-xl text-sm text-gray-600">
                {rule.descrizione}
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-navy-700 text-white hover:bg-navy-800"
                >
                  Note
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-navy-700 text-white hover:bg-navy-800"
                >
                  {rule.codiceSQL}
                </Button>
              </TableCell>
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
