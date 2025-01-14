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
        <div className="p-4 overflow-x-auto">
          <div className="block sm:hidden space-y-4">
            {mockMemberships.map((membership, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{membership.user}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {membership.cluster}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="inline-block w-20">Team:</span>
                    {membership.team}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <MembershipsTable memberships={mockMemberships} />
          </div>
        </div>
      </div>
    </div>
  )
}
