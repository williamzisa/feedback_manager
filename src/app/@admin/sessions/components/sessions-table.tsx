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
            <TableHead className="hidden sm:table-cell">Team</TableHead>
            <TableHead className="hidden sm:table-cell">Utenti</TableHead>
            <TableHead className="hidden lg:table-cell">Regole</TableHead>
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
                      <div className="mt-1">
                        <div 
                          className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                          title={getClusterNames(session.clusters).join(', ')}
                        >
                          {session.clusters?.length || 0} cluster{(session.clusters?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Regole:</span>
                      <div className="mt-1">
                        <div 
                          className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                          title={getRuleNames(session.regole).join(', ')}
                        >
                          {session.regole?.length || 0} regol{(session.regole?.length || 0) !== 1 ? 'e' : 'a'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-medium">Team:</span>
                        <div className="mt-1">
                          <div className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                            {session.teamPartecipanti} team
                          </div>
                        </div>
                      </div>
                      <span>•</span>
                      <div>
                        <span className="font-medium">Utenti:</span>
                        <div className="mt-1">
                          <div className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                            {session.utentiPartecipanti} utent{session.utentiPartecipanti !== 1 ? 'i' : 'e'}
                          </div>
                        </div>
                      </div>
                      <span>•</span>
                      <div>
                        <span className="font-medium">Feedback:</span>
                        <div className="mt-1">
                          <Badge variant="outline">{session.feedbackGenerati}</Badge>
                        </div>
                      </div>
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
                <div 
                  className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                  title={getClusterNames(session.clusters).join(', ')}
                >
                  {session.clusters?.length || 0} cluster{(session.clusters?.length || 0) !== 1 ? 's' : ''}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                  {session.teamPartecipanti} team
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs">
                  {session.utentiPartecipanti} utent{session.utentiPartecipanti !== 1 ? 'i' : 'e'}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div 
                  className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                  title={getRuleNames(session.regole).join(', ')}
                >
                  {session.regole?.length || 0} regol{(session.regole?.length || 0) !== 1 ? 'e' : 'a'}
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
