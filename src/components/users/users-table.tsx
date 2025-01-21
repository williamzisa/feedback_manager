import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import type { User } from '@/lib/types/users'
import { Badge } from '@/components/ui/badge'
import { mockUsers } from '@/lib/data/mock-users'

interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  const getMentorName = (mentorId: string | null) => {
    if (!mentorId) return null
    const mentor = mockUsers.find(u => u.id === mentorId)
    return mentor ? `${mentor.name} ${mentor.surname}` : null
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead className="hidden md:table-cell">Mentor</TableHead>
            <TableHead className="hidden sm:table-cell">Processi</TableHead>
            <TableHead className="hidden lg:table-cell">Livello</TableHead>
            <TableHead className="hidden md:table-cell">Team</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{user.name} {user.surname}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {/* Info aggiuntive visibili solo su mobile */}
                  <div className="md:hidden space-y-1 text-sm text-gray-500">
                    <div>Mentor: {getMentorName(user.mentorId) || 'Nessun mentor'}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Processi: {user.processes?.length || 0}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>Team: <Badge variant="outline" className="ml-1">3 team</Badge></span>
                    </div>
                    <div>Livello: {user.level || 'Non specificato'}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.mentorId ? (
                  <span className="text-gray-600">
                    {getMentorName(user.mentorId) || <span className="text-gray-400">Mentor non trovato</span>}
                  </span>
                ) : (
                  <span className="text-gray-400">Nessun mentor</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="flex flex-wrap gap-1">
                  {user.processes?.map((process) => (
                    <Badge key={process} variant="secondary">
                      {process}
                    </Badge>
                  ))}
                  {(!user.processes || user.processes.length === 0) && (
                    <span className="text-gray-400">Nessun processo</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {user.level || <span className="text-gray-400">Non specificato</span>}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">3 team</Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!users || users.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                Nessun utente trovato
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
