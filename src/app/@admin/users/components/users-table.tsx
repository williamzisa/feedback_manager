'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import type { User } from '@/lib/types/users'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/lib/supabase/queries'

interface UsersTableProps {
  users: User[]
  onEdit: (user: User) => void
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  // Ottieni tutti gli utenti per trovare i mentor
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: queries.users.getAll
  });

  // Ottieni tutti i livelli
  const { data: levels = [] } = useQuery({
    queryKey: ['levels'],
    queryFn: queries.levels.getAll
  });

  // Funzione per trovare il mentor di un utente
  const findMentor = (mentorId: string | null) => {
    if (!mentorId) return null;
    return allUsers.find(u => u.id === mentorId);
  };

  // Funzione per trovare il livello di un utente
  const findLevel = (levelId: string | null) => {
    if (!levelId) return null;
    return levels.find(l => l.id === levelId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead className="hidden md:table-cell">Mentor</TableHead>
            <TableHead className="hidden lg:table-cell">Livello</TableHead>
            <TableHead className="hidden md:table-cell">Stato</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => {
            const mentor = findMentor(user.mentor);
            const level = findLevel(user.level);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{user.name} {user.surname}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {/* Info aggiuntive visibili solo su mobile */}
                    <div className="md:hidden space-y-1 text-sm text-gray-500">
                      <div>Mentor: {mentor ? `${mentor.name} ${mentor.surname}` : 'Nessun mentor'}</div>
                      <div>Livello: {level ? `${level.role} ${level.step}` : 'Non specificato'}</div>
                      <div>Stato: {user.status}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {mentor ? (
                    <span className="text-gray-600">
                      {`${mentor.name} ${mentor.surname}`}
                    </span>
                  ) : (
                    <span className="text-gray-400">Nessun mentor</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {level ? (
                    <span className="text-gray-600">{`${level.role} ${level.step}`}</span>
                  ) : (
                    <span className="text-gray-400">Non specificato</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.status === 'active' ? "default" : "secondary"}>
                    {user.status === 'active' ? 'Attivo' : 'Inattivo'}
                  </Badge>
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
            );
          })}
          {(!users || users.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Nessun utente trovato
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
