'use client'

import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { UsersTable } from '@/components/users/users-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateUserDialog } from '@/components/users/dialogs/create-user-dialog'
import { EditUserDialog } from '@/components/users/dialogs/edit-user-dialog'
import { useState, useMemo } from 'react'
import { mockUsers, mockUsersApi } from '@/lib/data/mock-users'
import type { User, Level } from '@/lib/types/users'

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [userFilter, setUserFilter] = useState('')
  const [mentorFilter, setMentorFilter] = useState('')

  // Funzione per trovare il nome completo del mentor
  const getMentorName = (mentorId: string | null) => {
    if (!mentorId) return ''
    const mentor = mockUsers.find(u => u.id === mentorId)
    return mentor ? `${mentor.name} ${mentor.surname}`.toLowerCase() : ''
  }

  // Filtra gli utenti in base ai criteri di ricerca
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const userName = `${user.name} ${user.surname}`.toLowerCase()
      const userEmail = user.email.toLowerCase()
      const mentorName = getMentorName(user.mentorId)
      const searchUser = userFilter.toLowerCase()
      const searchMentor = mentorFilter.toLowerCase()

      const matchesUser = userName.includes(searchUser) || userEmail.includes(searchUser)
      const matchesMentor = mentorName.includes(searchMentor)

      return (!userFilter || matchesUser) && (!mentorFilter || matchesMentor)
    })
  }, [users, userFilter, mentorFilter])

  // Calcola le statistiche sui risultati filtrati
  const totalUsers = filteredUsers.length
  const totalMentors = filteredUsers.filter(u => u.isMentor).length
  const activeUsers = filteredUsers.filter(u => u.isActive).length
  const activeMentors = filteredUsers.filter(u => u.isMentor && u.isActive).length

  const handleSuccess = () => {
    setUsers([...mockUsers])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Utenti</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="N.UTENTI" value={totalUsers} className="bg-white shadow-sm" />
          <StatCard title="N.MENTOR" value={totalMentors} className="bg-blue-100" />
          <StatCard title="Utenti" value={activeUsers} className="bg-green-100" />
          <StatCard title="Mentor" value={activeMentors} className="bg-yellow-100" />
        </div>

        {/* Users Section */}
        <div className="mt-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca User"
                  className="w-full"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca Mentor"
                  className="w-full"
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                />
              </div>
            </div>
            <Button 
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuovo Utente
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">{filteredUsers.length} risultati</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <UsersTable 
                users={filteredUsers}
                onEdit={setEditingUser}
              />
            </div>
          </div>
        </div>
      </main>

      <CreateUserDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={async (data) => {
          try {
            const userData: Omit<User, 'id'> = {
              ...data,
              level: data.level as Level
            }
            await mockUsersApi.create(userData)
            return true
          } catch (error) {
            console.error('Error creating user:', error)
            return false
          }
        }}
        onSuccess={handleSuccess}
      />

      <EditUserDialog
        user={editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
