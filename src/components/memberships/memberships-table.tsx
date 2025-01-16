// Copiamo il contenuto dal file originale
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>UTENTE</TableHead>
          <TableHead>TEAM</TableHead>
          <TableHead>RUOLO</TableHead>
          <TableHead>DATA INGRESSO</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership, index) => (
          <TableRow key={index}>
            <TableCell>{membership.user}</TableCell>
            <TableCell>{membership.team}</TableCell>
            <TableCell>{membership.role}</TableCell>
            <TableCell>{membership.joinedAt}</TableCell>
            <TableCell>
              <button className="text-gray-400 hover:text-gray-500">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
