'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { queries } from '@/lib/supabase/queries'
import { useEffect, useState } from 'react'

interface UserSessionResult {
  session_id: string
  session_name: string
  user_id: string
  user_name: string
  level_name: string | null
  level_standard: number | null
  val_overall: number | null
  self_overall: number | null
  val_gap: number | null
  val_execution: number | null
  self_execution: number | null
  val_strategy: number | null
  self_strategy: number | null
  val_soft: number | null
  self_soft: number | null
}

export const SessionResultsTable = () => {
  const router = useRouter()
  const [results, setResults] = useState<UserSessionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await queries.userSessions.getAll()
        setResults(data)
      } catch (error) {
        console.error('Errore nel recupero dei risultati:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Funzione per formattare il gap in percentuale
  const formatGap = (gap: number | null) => {
    if (gap === null) return '-'
    return `${(gap * 100).toFixed(1)}%`
  }

  // Funzione per formattare i valori numerici
  const formatValue = (value: number | null) => {
    if (value === null) return '-'
    return value.toFixed(1)
  }

  // Funzione per formattare i valori con self assessment
  const formatValueWithSelf = (value: number | null, selfValue: number | null) => {
    const mainValue = formatValue(value)
    const self = selfValue !== null ? ` (${formatValue(selfValue)})` : ''
    return `${mainValue}${self}`
  }

  // Funzione per formattare il livello con lo standard
  const formatLevelWithStandard = (levelName: string | null, standard: number | null) => {
    if (!levelName) return '-'
    const standardStr = standard !== null ? ` (${standard.toFixed(1)})` : ''
    return `${levelName}${standardStr}`
  }

  const handleDetailClick = (sessionName: string, userName: string) => {
    const params = new URLSearchParams({
      session: sessionName,
      receiver: userName
    })
    router.push(`/admin/feedback-management?${params.toString()}`)
  }

  // Filtra i risultati in base al termine di ricerca
  const filteredResults = results.filter(result =>
    result.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <Input
            placeholder="Cerca Utente"
            className="w-full sm:w-auto bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          Export .csv
        </Button>
      </div>

      <div className="text-sm text-gray-500 mt-6 mb-2">
        {filteredResults.length} risultati
      </div>

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {loading ? (
          <div className="text-center py-4">Caricamento...</div>
        ) : filteredResults.map((result) => (
          <div key={`${result.session_id}-${result.user_id}`} className="mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="font-medium">{result.user_name}</div>
                <div className="text-sm text-gray-600">
                  <div className="mb-2">
                    <span className="font-medium">Sessione:</span> {result.session_name}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Ruolo:</span> {formatLevelWithStandard(result.level_name, result.level_standard)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Overall:</span> {formatValueWithSelf(result.val_overall, result.self_overall)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Gap:</span> {formatGap(result.val_gap)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Execution:</span> {formatValueWithSelf(result.val_execution, result.self_execution)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Strategy:</span> {formatValueWithSelf(result.val_strategy, result.self_strategy)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Soft:</span> {formatValueWithSelf(result.val_soft, result.self_soft)}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Caricamento...
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Nessun risultato trovato
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={`${result.session_id}-${result.user_id}`}>
                    <TableCell>{result.session_name}</TableCell>
                    <TableCell>{result.user_name}</TableCell>
                    <TableCell>{formatLevelWithStandard(result.level_name, result.level_standard)}</TableCell>
                    <TableCell>{formatValueWithSelf(result.val_overall, result.self_overall)}</TableCell>
                    <TableCell>{formatGap(result.val_gap)}</TableCell>
                    <TableCell>{formatValueWithSelf(result.val_execution, result.self_execution)}</TableCell>
                    <TableCell>{formatValueWithSelf(result.val_strategy, result.self_strategy)}</TableCell>
                    <TableCell>{formatValueWithSelf(result.val_soft, result.self_soft)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="default"
                        onClick={() => handleDetailClick(result.session_name, result.user_name)}
                      >
                        Dettaglio
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
} 