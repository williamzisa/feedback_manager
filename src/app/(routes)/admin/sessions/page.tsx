import { AdminHeader } from '@/components/layout/admin-header'
import { SessionsView } from '@/components/sessions/sessions-view'
import { StatCard } from '@/components/stats/stat-card'

export default function SessionsPage() {
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Sessioni</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="Totale Sessioni" value={7} className="bg-white shadow-sm" />
          <StatCard title="In preparazione" value={2} className="bg-yellow-100" />
          <StatCard title="In corso" value={3} className="bg-blue-100" />
          <StatCard title="Concluse" value={2} className="bg-green-100" />
        </div>

        {/* Sessions Section */}
        <div className="mt-6">
          <SessionsView />
        </div>
      </main>
    </div>
  )
}
