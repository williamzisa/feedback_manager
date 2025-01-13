import { Input } from '@/components/ui/input'
import { MembershipsTable } from './memberships-table'

const mockMemberships = [
  { user: 'Paolo Solazzo', team: 'Team 1', cluster: 'Marketing' },
  { user: 'Paolo Solazzo', team: 'Team 2', cluster: 'Marketing' },
  { user: 'Paolo Solazzo', team: 'Team 3', cluster: 'Operations' },
  { user: 'Paolo Solazzo', team: 'Team 4', cluster: 'Development' },
]

export const MembershipsView = () => {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca User"
            className="bg-white"
          />
        </div>
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca Team"
            className="bg-white"
          />
        </div>
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca Cluster"
            className="bg-white"
          />
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">110 user • 108 teams • 368 membership totali</p>
        </div>
        <div className="p-4">
          <MembershipsTable memberships={mockMemberships} />
        </div>
      </div>
    </div>
  )
}
