'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserTeamFormData } from "@/lib/types/memberships"
import { queries } from "@/lib/supabase/queries"

interface MembershipFormProps {
  onSubmit: (data: UserTeamFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  initialData?: UserTeamFormData
}

export function MembershipForm({
  onSubmit,
  onDelete,
  isLoading,
  mode = 'create',
  initialData
}: MembershipFormProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string; surname: string; email: string }>>([])
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          queries.users.getAll(),
          queries.teams.getAll()
        ])

        setUsers(usersData)
        setTeams(teamsData.map(team => ({
          id: team.id,
          name: team.name
        })))
      } catch (err) {
        console.error('Error loading form data:', err)
        setError('Errore nel caricamento dei dati')
      }
    }

    loadData()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    onSubmit({
      userId: formData.get('userId') as string,
      teamId: formData.get('teamId') as string
    })
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

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
