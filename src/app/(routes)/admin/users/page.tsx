import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { UsersTable } from '@/components/users/users-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockUsers = [
  { name: 'Paolo Solazzo', mentor: 'Paolo Solazzo', processes: 4, level: 'Manager (F) 1', teams: 4 },
  { name: 'Paolo Solazzo', mentor: 'Paolo Solazzo', processes: 2, level: 'PCG Manager 1', teams: 2 },
  { name: 'Paolo Solazzo', mentor: 'Paolo Solazzo', processes: 7, level: 'PCG Starter 1', teams: 7 },
  { name: 'Paolo Solazzo', mentor: 'Paolo Solazzo', processes: 5, level: 'Senior 1', teams: 5 },
]

export default function UsersPage() {
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
          <StatCard title="N.UTENTI" value={124} className="bg-white shadow-sm" />
          <StatCard title="N.MENTOR" value={29} className="bg-blue-100" />
          <StatCard title="Utenti" value={110} className="bg-green-100" />
          <StatCard title="Mentor" value={51} className="bg-yellow-100" />
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
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca Mentor"
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca Cluster"
                  className="w-full"
                />
              </div>
            </div>
            <Button className="w-full sm:w-auto whitespace-nowrap">
              Nuovo Utente
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">111 risultati</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="block sm:hidden space-y-4">
                {mockUsers.map((user, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {user.level}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center">
                        <span className="w-24">Mentor:</span>
                        <span>{user.mentor}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24">Processi:</span>
                        <span>{user.processes}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24">Teams:</span>
                        <span>{user.teams}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <UsersTable users={mockUsers} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
