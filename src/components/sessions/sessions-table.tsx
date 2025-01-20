import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface Session {
  id: number
  nomeSessione: string
  clusterPartecipanti: number
  teamPartecipanti: number
  utentiPartecipanti: number
  regoleApplicate: number
  feedbackGenerati: number
  stato: string
}

interface SessionsTableProps {
  sessions: Session[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NOME SESSIONE</TableHead>
            <TableHead>CLUSTER PARTECIPANTI</TableHead>
            <TableHead>TEAM PARTECIPANTI</TableHead>
            <TableHead>UTENTI PARTECIPANTI</TableHead>
            <TableHead>REGOLE APPLICATE</TableHead>
            <TableHead>FEEDBACK GENERATI</TableHead>
            <TableHead>STATO</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.id}</TableCell>
              <TableCell className="font-medium">{session.nomeSessione}</TableCell>
              <TableCell>{session.clusterPartecipanti}</TableCell>
              <TableCell>{session.teamPartecipanti}</TableCell>
              <TableCell>{session.utentiPartecipanti}</TableCell>
              <TableCell>{session.regoleApplicate}</TableCell>
              <TableCell>{session.feedbackGenerati}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {session.stato === 'In preparazione' && (
                    <svg
                      className="mr-2 h-4 w-4 text-yellow-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12" y2="16" />
                    </svg>
                  )}
                  {session.stato === 'In corso' && (
                    <svg
                      className="mr-2 h-4 w-4 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="M6 12l4 4 8-8" />
                    </svg>
                  )}
                  {session.stato === 'Conclusa' && (
                    <svg
                      className="mr-2 h-4 w-4 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  {session.stato === 'Content' && (
                    <svg
                      className="mr-2 h-4 w-4 text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  )}
                  {session.stato}
                </div>
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
