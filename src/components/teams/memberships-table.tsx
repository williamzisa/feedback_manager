import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Membership {
  user: string
  team: string
  cluster: string
}

interface MembershipsTableProps {
  memberships: Membership[]
}

export const MembershipsTable = ({ memberships }: MembershipsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>USER</TableHead>
          <TableHead>TEAM</TableHead>
          <TableHead>CLUSTER</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((membership, index) => (
          <TableRow key={index}>
            <TableCell>{membership.user}</TableCell>
            <TableCell>{membership.team}</TableCell>
            <TableCell>{membership.cluster}</TableCell>
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
