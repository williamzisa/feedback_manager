import { StatCard } from '@/components/stats/stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamsView } from '@/components/teams/teams-view'
import { MembershipsView } from '@/components/teams/memberships-view'

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <h2 className="text-xl font-semibold">Teams</h2>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="STAT1" value={18} className="bg-white shadow-sm" />
          <StatCard title="STAT2" value={113} className="bg-red-100" />
          <StatCard title="STAT3" value={33} className="bg-red-100" />
          <StatCard title="STAT4" value={6} className="bg-green-100" />
        </div>

        {/* Teams Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="mb-4 w-full flex space-x-2 overflow-x-auto">
              <TabsTrigger value="teams" className="flex-1 flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5"
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
                Teams
              </TabsTrigger>
              <TabsTrigger value="membership" className="flex-1 flex items-center justify-center">
                <svg
                  className="mr-2 h-5 w-5"
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
                Membership
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="space-y-4">
              <TeamsView />
            </TabsContent>
            
            <TabsContent value="membership" className="space-y-4">
              <MembershipsView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
