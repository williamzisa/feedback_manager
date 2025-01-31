'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileEdit } from 'lucide-react'
import { Feedback } from '@/lib/types/feedbacks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/lib/supabase/queries'

interface PreSessionFeedbacksTableProps {
  sessionId: string
}

export const PreSessionFeedbacksTable = ({ sessionId }: PreSessionFeedbacksTableProps) => {
  const [filterDuplicates, setFilterDuplicates] = useState(false)
  const searchParams = useSearchParams()
  const receiverFilter = searchParams.get('receiver')

  // Ottieni l'utente corrente
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  });

  // Ottieni i feedback per la sessione corrente
  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ['feedbacks', sessionId],
    queryFn: async () => {
      if (!currentUser?.company) throw new Error('Company non disponibile');
      const result = await queries.feedbacks.getBySession(sessionId);
      return result;
    },
    enabled: !!sessionId && !!currentUser?.company
  });

  // Filtra i feedback in base ai parametri URL
  const filteredFeedbacks = feedbacks.filter((feedback: Feedback) => {
    if (receiverFilter && feedback.receiver !== receiverFilter) {
      return false
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Caricamento feedback...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <Input
            placeholder="Cerca Mittente"
            className="w-full sm:w-auto bg-white"
          />
          <Input
            placeholder="Cerca Destinatario"
            className="w-full sm:w-auto bg-white"
            defaultValue={receiverFilter || ''}
          />
          <Input
            placeholder="Cerca Domanda"
            className="w-full sm:w-auto bg-white"
          />
          <Select>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Type domanda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Soft</SelectItem>
              <SelectItem value="execution">Execution</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Regola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Regola 1</SelectItem>
              <SelectItem value="2">Regola 2</SelectItem>
              <SelectItem value="3">Regola 3</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center h-10 space-x-2 whitespace-nowrap">
            <Checkbox 
              id="filterDuplicates" 
              checked={filterDuplicates}
              onCheckedChange={(checked) => setFilterDuplicates(checked as boolean)}
            />
            <Label htmlFor="filterDuplicates" className="leading-none">Filtra duplicati</Label>
          </div>
        </div>
        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          Export .csv
        </Button>
      </div>

      <div className="text-sm text-gray-500 mt-6 mb-2">
        {filteredFeedbacks.length} risultati
      </div>

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="font-medium">ID: {feedback.id}</div>
                <div className="text-sm text-gray-600">
                  <div className="mb-2">
                    <span className="font-medium">Mittente:</span> {feedback.sender}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Destinatario:</span> {feedback.receiver}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Domanda:</span>
                    <div className="mt-1 break-words">{feedback.question}</div>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Regola:</span>
                    <div className="mt-1">{feedback.rule_number || '-'}</div>
                  </div>
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="mt-1">
                      <div 
                        className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                        title={feedback.tags.join(', ')}
                      >
                        {feedback.tags.length} tag{feedback.tags.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <FileEdit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="rounded-md border min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID FEEDBACK</TableHead>
                <TableHead>MITTENTE</TableHead>
                <TableHead>DESTINATARIO</TableHead>
                <TableHead>DOMANDA</TableHead>
                <TableHead>REGOLA</TableHead>
                <TableHead>TAG</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.id}</TableCell>
                  <TableCell>{feedback.sender}</TableCell>
                  <TableCell>{feedback.receiver}</TableCell>
                  <TableCell className="max-w-md truncate">{feedback.question}</TableCell>
                  <TableCell>{feedback.rule_number || '-'}</TableCell>
                  <TableCell>
                    <div 
                      className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs inline-block"
                      title={feedback.tags.join(', ')}
                    >
                      {feedback.tags.length} tag{feedback.tags.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFeedbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Nessun feedback trovato
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