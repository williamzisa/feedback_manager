import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'
import type { Level } from "@/lib/types/levels"

interface LevelsTableProps {
  levels: Level[]
  onEdit: (level: Level) => void
}

export function LevelsTable({ levels, onEdit }: LevelsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ruolo</TableHead>
          <TableHead>Step</TableHead>
          <TableHead className="text-center">% Execution</TableHead>
          <TableHead className="text-center">% Soft</TableHead>
          <TableHead className="text-center">% Strategy</TableHead>
          <TableHead className="text-center">Standard</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {levels.map((level) => (
          <TableRow key={level.id}>
            <TableCell className="font-medium">{level.ruolo}</TableCell>
            <TableCell>{level.step}</TableCell>
            <TableCell className="text-center">{level.execution}%</TableCell>
            <TableCell className="text-center">{level.soft}%</TableCell>
            <TableCell className="text-center">{level.strategy}%</TableCell>
            <TableCell className="text-center">{level.standard}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(level)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
