'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface UserSessionResult {
  id: string
  session_name: string
  level_name: string
  user_name: string
  overall: number
  gap: number
  execution: number
  strategy: number
  soft: number
}

export const SessionResultsTable = () => {
  const router = useRouter()
  
  // Mock data - da sostituire con dati reali dal backend
  const results: UserSessionResult[] = [
    {
      id: '1',
      session_name: 'Sessione Q4 2023',
      level_name: 'Livello 1',
      user_name: 'William Zisa',
      overall: 4.1,
      gap: 0.15,
      execution: 4.2,
      strategy: 3.5,
      soft: 3.8
    },
    {
      id: '2',
      session_name: 'Sessione Q4 2023',
      level_name: 'Livello 2',
      user_name: 'Alessandro Cinus',
      overall: 4.1,
      gap: 0.15,
      execution: 4.2,
      strategy: 3.5,
      soft: 3.8
    },
    {
      id: '3',
      session_name: 'Sessione Q4 2023',
      level_name: 'Livello 3',
      user_name: 'Marco Rossi',
      overall: 3.9,
      gap: 0.22,
      execution: 3.8,
      strategy: 4.0,
      soft: 3.9
    },
    {
      id: '4',
      session_name: 'Sessione Q3 2023',
      level_name: 'Livello 2',
      user_name: 'William Zisa',
      overall: 3.8,
      gap: 0.18,
      execution: 3.9,
      strategy: 3.7,
      soft: 3.8
    },
    {
      id: '5',
      session_name: 'Sessione Q3 2023',
      level_name: 'Livello 1',
      user_name: 'Laura Bianchi',
      overall: 4.3,
      gap: 0.12,
      execution: 4.4,
      strategy: 4.2,
      soft: 4.3
    }
  ]

  // Funzione per formattare il gap in percentuale
  const formatGap = (gap: number) => {
    return `${(gap * 100).toFixed(1)}%`
  }

  const handleDetailClick = (sessionName: string, userName: string) => {
    const params = new URLSearchParams({
      session: sessionName,
      receiver: userName
    })
    router.push(`/admin/feedback-management?${params.toString()}`)
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <Input
            placeholder="Cerca Utente"
            className="w-full sm:w-auto bg-white"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          Export .csv
        </Button>
      </div>

      <div className="text-sm text-gray-500 mt-6 mb-2">
        {results.length} risultati
      </div>

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {results.map((result) => (
          <div key={result.id} className="mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="font-medium">{result.user_name}</div>
                <div className="text-sm text-gray-600">
                  <div className="mb-2">
                    <span className="font-medium">Sessione:</span> {result.session_name}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Ruolo:</span> {result.level_name}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Overall:</span> {result.overall}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Gap:</span> {formatGap(result.gap)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Execution:</span> {result.execution}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Strategy:</span> {result.strategy}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Soft:</span> {result.soft}
                  </div>
                </div>
              </div>
              <Button 
                variant="default"
                onClick={() => handleDetailClick(result.session_name, result.user_name)}
              >
                Dettaglio
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop */}
      <div className="hidden sm:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SESSIONE</TableHead>
                <TableHead>UTENTE</TableHead>
                <TableHead>RUOLO</TableHead>
                <TableHead>OVERALL</TableHead>
                <TableHead>GAP</TableHead>
                <TableHead>EXECUTION</TableHead>
                <TableHead>STRATEGY</TableHead>
                <TableHead>SOFT</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.session_name}</TableCell>
                  <TableCell>{result.user_name}</TableCell>
                  <TableCell>{result.level_name}</TableCell>
                  <TableCell>{result.overall}</TableCell>
                  <TableCell>{formatGap(result.gap)}</TableCell>
                  <TableCell>{result.execution}</TableCell>
                  <TableCell>{result.strategy}</TableCell>
                  <TableCell>{result.soft}</TableCell>
                  <TableCell>
                    <Button 
                      variant="default"
                      onClick={() => handleDetailClick(result.session_name, result.user_name)}
                    >
                      Dettaglio
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Nessun risultato trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
} 