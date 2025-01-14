import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { ProcessesTable } from '@/components/processes/processes-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockProcesses = [
  { processo: 'Safety specialist', nUser: 2, idDomandaCollegata: 21 },
  { processo: 'Facility manager', nUser: 4, idDomandaCollegata: 91 },
  { processo: 'Legal specialist', nUser: 4, idDomandaCollegata: 89 },
  { processo: 'Compliance specialist', nUser: 6, idDomandaCollegata: 83 },
]

export default function ProcessesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="110 user" value={110} className="bg-white shadow-sm" />
          <StatCard title="Processi" value={16} className="bg-blue-100" />
          <StatCard title="Domande" value={284} className="bg-green-100" />
          <StatCard title="Risposte" value={1420} className="bg-yellow-100" />
        </div>

        {/* Processes Section */}
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h2 className="text-xl font-semibold">Processi</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Input
                type="search"
                placeholder="Cerca Processo"
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
              Aggiungi Processo
            </Button>
          </div>

          <ProcessesTable processes={mockProcesses} />
        </div>
      </main>
    </div>
  )
}
