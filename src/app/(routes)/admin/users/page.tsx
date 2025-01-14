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
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="N.UTENTI" value={124} className="bg-white shadow-sm" />
          <StatCard title="N.MENTOR" value={29} className="bg-blue-100" />
          <StatCard title="Utenti" value={110} className="bg-green-100" />
          <StatCard title="Mentor" value={51} className="bg-yellow-100" />
        </div>

        {/* Users Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center">
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
            <h2 className="text-xl font-semibold">Users</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca User"
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca Mentor"
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca Cluster"
                className="w-full"
              />
            </div>
            <Button className="w-full sm:w-auto">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Aggiungi User
            </Button>
          </div>

          <UsersTable users={mockUsers} />
        </div>
      </main>
    </div>
  )
}
