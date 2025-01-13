import { AdminHeader } from '@/components/layout/admin-header'
import { StatCard } from '@/components/stats/stat-card'
import { ClustersTable } from '@/components/clusters/clusters-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockClusters = [
  { name: 'Marketing', leader: 'Paolo Solazzo', level: 1, teamCount: 21 },
  { name: 'Finance', leader: 'Paolo Solazzo', level: 1, teamCount: 14 },
  { name: 'Operations', leader: 'Paolo Solazzo', level: 2, teamCount: 8 },
  { name: 'Development', leader: 'Paolo Solazzo', level: 2, teamCount: 4 },
]

export default function ClustersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="mx-auto max-w-full px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="STAT1" value={18} className="bg-white shadow-sm" />
          <StatCard title="STAT2" value={113} className="bg-red-100" />
          <StatCard title="STAT3" value={33} className="bg-red-100" />
          <StatCard title="STAT4" value={6} className="bg-green-100" />
        </div>

        {/* Clusters Section */}
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h2 className="text-xl font-semibold">Clusters</h2>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Input
                type="text"
                placeholder="Cerca Cluster"
                className="bg-white"
              />
            </div>
            <Button className="w-full sm:w-auto bg-[#1E2A4A] text-white hover:bg-[#2A3B66]">
              AGGIUNGI CLUSTER
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">111 risultati</p>
            </div>
            <div className="p-4">
              <ClustersTable clusters={mockClusters} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
