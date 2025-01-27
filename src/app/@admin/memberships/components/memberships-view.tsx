'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MembershipsTable } from './memberships-table'
import { CreateMembershipDialog } from './dialogs/create-membership-dialog'
import { EditMembershipDialog } from './dialogs/edit-membership-dialog'
import { queries } from '@/lib/supabase/queries'
import type { UserTeam } from '@/lib/types/memberships'

export function MembershipsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMembership, setEditingMembership] = useState<UserTeam | null>(null)
  const [userFilter, setUserFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')

  const { data: memberships = [], refetch } = useQuery({
    queryKey: ['memberships'],
    queryFn: queries.userTeams.getAll
  })

  // Filtra le membership in base ai criteri di ricerca
  const filteredMemberships = memberships.filter(membership => {
    const userName = membership.users ? `${membership.users.name} ${membership.users.surname}`.toLowerCase() : ''
    const teamName = membership.teams?.name?.toLowerCase() ?? ''
    const searchUser = userFilter.toLowerCase()
    const searchTeam = teamFilter.toLowerCase()

    return (!userFilter || userName.includes(searchUser)) && 
           (!teamFilter || teamName.includes(searchTeam))
  })

  const handleEdit = (membership: UserTeam) => {
    setEditingMembership(membership)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Membership
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Cerca User"
                className="w-full sm:w-64 bg-white"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
              <Input
                type="search"
                placeholder="Cerca Team"
                className="w-full sm:w-64 bg-white"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              />
            </div>
            <Button 
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() => setIsCreateOpen(true)}
            >
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuova Membership
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">{filteredMemberships.length} risultati</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <MembershipsTable 
                memberships={filteredMemberships}
                onEdit={handleEdit}
              />
            </div>
          </div>

          <CreateMembershipDialog 
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={refetch}
          />

          <EditMembershipDialog
            membership={editingMembership}
            open={editingMembership !== null}
            onOpenChange={(open) => !open && setEditingMembership(null)}
            onSuccess={refetch}
          />
        </div>
      </main>
    </div>
  )
}
