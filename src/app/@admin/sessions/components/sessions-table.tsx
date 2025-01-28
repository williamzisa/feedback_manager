import { Session } from '@/lib/types/sessions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'

interface SessionsTableProps {
  sessions: Session[]
  onEdit: (session: Session) => void
}

export function SessionsTable({ sessions, onEdit }: SessionsTableProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('it-IT')
  }

  const getClusterNames = (session: Session) => {
    return session.session_clusters
      ?.map(sc => sc.cluster.name)
      .join(', ') || '-'
  }

  const getRuleNames = (session: Session) => {
    return session.session_rules
      ?.map(sr => sr.rule.name)
      .join(', ') || '-'
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nessuna sessione trovata
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome Sessione</TableHead>
          <TableHead>Data Inizio</TableHead>
          <TableHead>Data Fine</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Cluster</TableHead>
          <TableHead>Regole</TableHead>
          <TableHead className="w-[100px]">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{session.name}</TableCell>
            <TableCell>{formatDate(session.start_time)}</TableCell>
            <TableCell>{formatDate(session.end_time)}</TableCell>
            <TableCell>{session.status}</TableCell>
            <TableCell>{getClusterNames(session)}</TableCell>
            <TableCell>{getRuleNames(session)}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(session)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
