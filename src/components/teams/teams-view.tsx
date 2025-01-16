import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TeamsTable } from './teams-table'

const mockTeams = [
  { name: 'Team 1', cluster: 'Marketing', leader: 'Paolo Solazzo', members: 5 },
  { name: 'Team 2', cluster: 'Marketing', leader: 'Paolo Solazzo', members: 1 },
  { name: 'Team 3', cluster: 'Operations', leader: 'Paolo Solazzo', members: 4 },
  { name: 'Team 4', cluster: 'Development', leader: 'Paolo Solazzo', members: 8 },
]

export const TeamsView = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <Input
          type="text"
          placeholder="Cerca Teams"
          className="bg-white w-full sm:w-96"
        />
        <Button className="bg-[#1E2A4A] text-white hover:bg-[#2A3B66] w-full sm:w-auto">
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
            <path d="M12 5v14M5 12h14" />
          </svg>
          AGGIUNGI TEAM
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">111 risultati</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="block sm:hidden">
            {mockTeams.map((team, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {team.cluster}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <span className="w-20">Leader:</span>
                    {team.leader}
                  </p>
                  <p className="flex items-center">
                    <span className="w-20">Membri:</span>
                    {team.members}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <TeamsTable teams={mockTeams} />
          </div>
        </div>
      </div>
    </div>
  )
}
