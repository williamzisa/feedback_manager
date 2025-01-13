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
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca Teams"
            className="bg-white"
          />
        </div>
        <Button className="w-full sm:w-auto bg-[#1E2A4A] text-white hover:bg-[#2A3B66]">
          AGGIUNGI TEAM
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">111 risultati</p>
        </div>
        <div className="p-4">
          <TeamsTable teams={mockTeams} />
        </div>
      </div>
    </div>
  )
}
