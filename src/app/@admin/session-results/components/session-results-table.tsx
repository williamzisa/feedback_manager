'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { queries } from '@/lib/supabase/queries'
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  // Additional fields for PDF generation
  session_id?: string
  user_id?: string
}

export const SessionResultsTable = () => {
  const router = useRouter()
  const [results, setResults] = useState<UserSessionResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSessionResults = async () => {
      try {
        setLoading(true)
        
        // Recuperiamo i dati reali dal database usando la nuova query
        const sessionResults = await queries.sessions.getSessionResults()
        // Ordiniamo i risultati per gap decrescente
        const sortedResults = sessionResults.sort((a, b) => b.gap - a.gap)
        setResults(sortedResults)
      } catch (err) {
        console.error('Errore nel recupero dei risultati delle sessioni:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSessionResults()
  }, [])
  
  // Ottieni le sessioni uniche per il selettore
  const uniqueSessions = Array.from(new Set(results.map(r => r.session_name)))
  
  // Filtra i risultati in base alla ricerca e alla sessione selezionata
  const filteredResults = results.filter(result =>
    result.user_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedSession === 'all' || result.session_name === selectedSession)
  )

  // Funzione per formattare il gap in percentuale
  const formatGap = (gap: number) => {
    return `${gap.toFixed(1)}%`
  }

  // Funzione per formattare i numeri decimali
  const formatNumber = (num: number) => {
    return num.toFixed(2)
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
          <Select
            value={selectedSession}
            onValueChange={setSelectedSession}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Seleziona Sessione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le sessioni</SelectItem>
              {uniqueSessions.map((session) => (
                <SelectItem key={session} value={session}>
                  {session}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                        <span className="font-medium">Overall:</span> {formatNumber(result.overall)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Gap:</span> {formatGap(result.gap)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Execution:</span> {formatNumber(result.execution)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Strategy:</span> {formatNumber(result.strategy)}
                      </div>
                      <div className="mb-2">
                        <span className="font-medium">Soft:</span> {formatNumber(result.soft)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="default"
                    onClick={() => handleDetailClick(result.session_name, result.user_name)}
                  >
                    Dettaglio
                  </Button>
                  {result.session_id && result.user_id && (
                    <PDFDownloadButton
                      sessionId={result.session_id}
                      userId={result.user_id}
                      userName={result.user_name}
                      compact={true}
                    />
                  )}
                </div>
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
                    <TableHead className="w-[120px]">AZIONI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.session_name}</TableCell>
                      <TableCell>{result.user_name}</TableCell>
                      <TableCell>{result.level_name}</TableCell>
                      <TableCell>{formatNumber(result.overall)}</TableCell>
                      <TableCell>{formatGap(result.gap)}</TableCell>
                      <TableCell>{formatNumber(result.execution)}</TableCell>
                      <TableCell>{formatNumber(result.strategy)}</TableCell>
                      <TableCell>{formatNumber(result.soft)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleDetailClick(result.session_name, result.user_name)}
                          >
                            Dettaglio
                          </Button>
                          {result.session_id && result.user_id && (
                            <PDFDownloadButton
                              sessionId={result.session_id}
                              userId={result.user_id}
                              userName={result.user_name}
                              compact={true}
                            />
                          )}
                        </div>
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