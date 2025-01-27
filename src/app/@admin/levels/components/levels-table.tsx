import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
          <TableHead className="text-center">Step</TableHead>
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
            <TableCell className="font-medium">{level.role}</TableCell>
            <TableCell className="text-center">{level.step}</TableCell>
            <TableCell className="text-center">{level.execution_weight}%</TableCell>
            <TableCell className="text-center">{level.soft_weight}%</TableCell>
            <TableCell className="text-center">{level.strategy_weight}%</TableCell>
            <TableCell className="text-center">{level.standard}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(level)}
              >
                Modifica
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
