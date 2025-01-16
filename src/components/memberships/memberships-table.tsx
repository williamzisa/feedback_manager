import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Button } from "../ui/button"

interface Membership {
  user: string
  team: string
  role: string
  joinedAt: string
}

interface MembershipsTableProps {
  memberships: Membership[]
}

const mockMemberships = [
  { user: 'Mario Rossi', team: 'Team 1', role: 'Developer', joinedAt: '2024-01-01' },
  { user: 'Luigi Verdi', team: 'Team 2', role: 'Designer', joinedAt: '2024-01-02' },
  { user: 'Anna Bianchi', team: 'Team 1', role: 'Manager', joinedAt: '2024-01-03' },
  { user: 'Giovanni Neri', team: 'Team 3', role: 'Developer', joinedAt: '2024-01-04' },
]

export const MembershipsTable = ({ memberships = mockMemberships }: MembershipsTableProps) => {
  return (
    <>
      {/* Versione Mobile */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {memberships.map((membership, index) => (
          <div key={index} className="bg-white space-y-3 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 text-sm">
              <div className="text-gray-900 font-bold">{membership.user}</div>
              <div className="text-gray-500">{membership.team}</div>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Ruolo:</span> {membership.role}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Data Ingresso:</span> {membership.joinedAt}
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span className="ml-2">Modifica</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Versione Desktop */}
      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utente</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Data Ingresso</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((membership, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{membership.user}</TableCell>
                <TableCell>{membership.team}</TableCell>
                <TableCell>{membership.role}</TableCell>
                <TableCell>{membership.joinedAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
