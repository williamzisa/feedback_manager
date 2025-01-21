import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import type { Session } from '@/lib/types/sessions'
import { Badge } from '@/components/ui/badge'
import { mockClusters, mockRules } from '@/lib/data/mock-sessions'

interface SessionsTableProps {
  sessions: Session[]
  onEdit: (session: Session) => void
}

export function SessionsTable({ sessions, onEdit }: SessionsTableProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getClusterNames = (clusterIds: string[] | undefined) => {
    if (!clusterIds?.length) return []
    return clusterIds.map(id => mockClusters.find(c => c.id === id)?.name).filter(Boolean)
  }

  const getRuleNames = (ruleIds: string[] | undefined) => {
    if (!ruleIds?.length) return []
    return ruleIds.map(id => mockRules.find(r => r.id === id)?.name).filter(Boolean)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In preparazione':
        return 'bg-yellow-100 text-yellow-800'
      case 'In corso':
        return 'bg-blue-100 text-blue-800'
      case 'Conclusa':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Sessione</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden sm:table-cell">Cluster</TableHead>
            <TableHead className="hidden lg:table-cell">Regole</TableHead>
            <TableHead className="hidden xl:table-cell">Partecipanti</TableHead>
            <TableHead className="hidden md:table-cell">Feedback</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions?.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{session.nomeSessione}</div>
                  <Badge className={getStatusColor(session.stato)}>{session.stato}</Badge>
                  {/* Info aggiuntive visibili solo su mobile */}
                  <div className="md:hidden space-y-1 text-sm text-gray-500 mt-2">
                    <div>
                      <span className="font-medium">Date:</span>
                      <div className="flex gap-2 text-xs mt-1">
                        <span>Da: {formatDate(session.dataInizio) || 'Non specificata'}</span>
                        <span>•</span>
                        <span>A: {formatDate(session.dataFine) || 'Non specificata'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Cluster:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getClusterNames(session.clusters).map((name) => (
                          <Badge key={name} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Regole:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getRuleNames(session.regole).map((name) => (
                          <Badge key={name} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        <span className="font-medium">Partecipanti:</span>{' '}
                        {session.utentiPartecipanti}
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium">Feedback:</span>{' '}
                        {session.feedbackGenerati}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  <div className="text-sm">
                    Da: {formatDate(session.dataInizio) || 'Non specificata'}
                  </div>
                  <div className="text-sm">
                    A: {formatDate(session.dataFine) || 'Non specificata'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {getClusterNames(session.clusters).map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                  {(!session.clusters || session.clusters.length === 0) && (
                    <span className="text-gray-400">Nessun cluster</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {getRuleNames(session.regole).map((name) => (
                    <Badge key={name} variant="outline">
                      {name}
                    </Badge>
                  ))}
                  {(!session.regole || session.regole.length === 0) && (
                    <span className="text-gray-400">Nessuna regola</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="space-y-1">
                  <div className="text-sm">
                    Utenti: {session.utentiPartecipanti}
                  </div>
                  <div className="text-sm">
                    Team: {session.teamPartecipanti}
                  </div>
                  <div className="text-sm">
                    Cluster: {session.clusterPartecipanti}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{session.feedbackGenerati}</Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(session)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!sessions || sessions.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                Nessuna sessione trovata
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
