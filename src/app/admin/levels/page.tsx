import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { LevelsTable } from '@/components/levels/levels-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockLevels = [
  { categoria: 'CEO', numero: 1, lettera: 'A', pesoExecution: '30%', pesoSoft: '30%', pesoStrategy: '40%', standard: 4.2, nUser: 2 },
  { categoria: 'Chief', numero: 2, lettera: 'A', pesoExecution: '30%', pesoSoft: '40%', pesoStrategy: '30%', standard: 4, nUser: 4 },
  { categoria: 'Director', numero: 1, lettera: 'A', pesoExecution: '40%', pesoSoft: '30%', pesoStrategy: '30%', standard: 4, nUser: 4 },
  { categoria: 'Director', numero: 3, lettera: 'B', pesoExecution: '30%', pesoSoft: '50%', pesoStrategy: '20%', standard: 3.8, nUser: 6 },
]

export default function LevelsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="110 user" value={110} className="bg-white shadow-sm" />
          <StatCard title="51 mentor" value={51} className="bg-blue-100" />
          <StatCard title="Livelli" value={12} className="bg-green-100" />
          <StatCard title="Categorie" value={4} className="bg-yellow-100" />
        </div>

        {/* Levels Section */}
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <h2 className="text-xl font-semibold">Livelli</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca Livello"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Aggiungi Livello
            </Button>
          </div>

          <LevelsTable levels={mockLevels} />
        </div>
      </main>
    </div>
  )
}
