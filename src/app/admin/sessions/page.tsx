import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { SessionsTable } from '@/components/sessions/sessions-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockSessions = [
  { id: 1, nomeSessione: 'Dicembre PCG', clusterPartecipanti: 7, teamPartecipanti: 23, utentiPartecipanti: 56, regoleApplicate: 13.5, feedbackGenerati: 2365, stato: 'In preparazione' },
  { id: 2, nomeSessione: 'Alessandro Cinus', clusterPartecipanti: 26, teamPartecipanti: 26, utentiPartecipanti: 26, regoleApplicate: 13.5, feedbackGenerati: 7460, stato: 'In corso' },
  { id: 3, nomeSessione: 'Alessia Naranjo', clusterPartecipanti: 35, teamPartecipanti: 35, utentiPartecipanti: 35, regoleApplicate: 13.5, feedbackGenerati: 3216, stato: 'Conclusa' },
  { id: 4, nomeSessione: 'Haria Taddia', clusterPartecipanti: 74, teamPartecipanti: 74, utentiPartecipanti: 74, regoleApplicate: 13.5, feedbackGenerati: 9866, stato: 'Content' },
  { id: 5, nomeSessione: 'Lorenzo Veiluva', clusterPartecipanti: 72, teamPartecipanti: 72, utentiPartecipanti: 72, regoleApplicate: 13.5, feedbackGenerati: 5296, stato: 'Content' },
]

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">NUMERO SESSIONI</h2>
          <p className="text-4xl font-bold">7</p>
        </div>

        {/* Sessions Section */}
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2 className="text-xl font-semibold">Sessioni</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-64">
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option>All Sessions</option>
                <option>In preparazione</option>
                <option>In corso</option>
                <option>Conclusa</option>
                <option>Content</option>
              </select>
            </div>
            <div className="w-full sm:w-64">
              <Input
                type="search"
                placeholder="Cerca Cluster"
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-32">
              <Input
                type="text"
                placeholder="Da"
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-32">
              <Input
                type="text"
                placeholder="A"
                className="w-full"
              />
            </div>
            <Button className="w-full sm:w-auto ml-auto">
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
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              AGGIUNGI SESSIONE
            </Button>
          </div>

          <SessionsTable sessions={mockSessions} />
        </div>
      </main>
    </div>
  )
}
