import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { ProcessesView } from '@/components/processes/processes-view'

export default function ProcessesPage() {
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Processi</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="110 user" value={110} className="bg-white shadow-sm" />
          <StatCard title="Processi" value={16} className="bg-blue-100" />
          <StatCard title="Domande" value={284} className="bg-green-100" />
          <StatCard title="Risposte" value={1420} className="bg-yellow-100" />
        </div>

        {/* Processes Section */}
        <div className="mt-6">
          <ProcessesView />
        </div>
      </main>
    </div>
  )
}
