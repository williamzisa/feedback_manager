'use client'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUsersApi } from "@/lib/data/mock-users"
import { mockMembershipsApi } from "@/lib/data/mock-memberships"
import type { MembershipFormData } from "@/lib/types/memberships"

interface MembershipFormProps {
  onSubmit: (data: MembershipFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  initialData?: MembershipFormData
}

export function MembershipForm({
  onSubmit,
  onDelete,
  isLoading,
  mode = 'create',
  initialData
}: MembershipFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    onSubmit({
      userId: formData.get('userId') as string,
      teamId: formData.get('teamId') as string
    })
  }

  // Ottieni la lista degli utenti disponibili (senza duplicati)
  const users = mockUsersApi.getAll().sort((a, b) => 
    `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`)
  )

  // Ottieni la lista dei team disponibili (senza duplicati)
  const teams = Array.from(
    new Map(mockMembershipsApi.getAll()
      .filter(m => m.team) // Filtra solo i membership con team definito
      .map(m => [m.team_id, { id: m.team_id, name: m.team?.name || 'Team senza nome' }]))
      .values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Select name="userId" defaultValue={initialData?.userId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona utente" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.surname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Select name="teamId" defaultValue={initialData?.teamId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map(team => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button type="submit" disabled={isLoading}>
          {mode === 'create' ? 'Crea' : 'Salva'}
        </Button>
        {mode === 'edit' && onDelete && (
          <Button 
            type="button" 
            variant="destructive" 
            disabled={isLoading}
            onClick={onDelete}
          >
            Elimina
          </Button>
        )}
      </div>
    </form>
  )
}
