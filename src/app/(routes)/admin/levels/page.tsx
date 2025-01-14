import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { LevelsView } from '@/components/levels/levels-view'

export default function LevelsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-4 sm:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center">
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h2 className="text-xl font-semibold">Livelli</h2>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title="110 user" value={110} className="bg-white shadow-sm" />
          <StatCard title="51 mentor" value={51} className="bg-blue-100" />
          <StatCard title="Livelli" value={12} className="bg-green-100" />
          <StatCard title="Categorie" value={4} className="bg-yellow-100" />
        </div>

        {/* Levels Section */}
        <div className="mt-6">
          <LevelsView />
        </div>
      </main>
    </div>
  )
}
