import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Team {
  name: string
  cluster: string
  leader: string
  members: number
}

interface TeamsTableProps {
  teams: Team[]
}

export const TeamsTable = ({ teams }: TeamsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TEAM</TableHead>
          <TableHead>CLUSTER</TableHead>
          <TableHead>TEAM LEADER</TableHead>
          <TableHead>MEMBERS</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.name}>
            <TableCell>{team.name}</TableCell>
            <TableCell>{team.cluster}</TableCell>
            <TableCell>{team.leader}</TableCell>
            <TableCell>{team.members}</TableCell>
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
