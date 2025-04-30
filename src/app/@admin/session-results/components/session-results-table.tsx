'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { queries } from '@/lib/supabase/queries'

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
  const [results, setResults] = useState<UserSessionResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSessionResults = async () => {
      try {
        setLoading(true)
        
        // Recuperiamo i dati reali dal database usando la nuova query
        const sessionResults = await queries.sessions.getSessionResults()
        setResults(sessionResults)
      } catch (err) {
        console.error('Errore nel recupero dei risultati delle sessioni:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessionResults()
  }, [])
  
  // Filtra i risultati in base alla ricerca
  const filteredResults = results.filter(result =>
    result.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          Export .csv
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mt-6 mb-2">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">Caricamento in corso...</div>
      ) : (
        <>
          <div className="text-sm text-gray-500 mt-6 mb-2">
            {filteredResults.length} risultati
          </div>

          {/* Vista Mobile */}
          <div className="block sm:hidden space-y-4">
            {filteredResults.map((result) => (
              <div key={result.id} className="mb-4 bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
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
                </div>
                <Button 
                  variant="default"
                  onClick={() => handleDetailClick(result.session_name, result.user_name)}
                >
                  Dettaglio
                </Button>
              </div>
            ))}
            
            {filteredResults.length === 0 && (
              <div className="text-center py-4">Nessun risultato trovato</div>
            )}
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
                  {filteredResults.map((result) => (
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
                  {filteredResults.length === 0 && (
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
      )}
    </>
  )
} 