'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit } from 'lucide-react'
import { Feedback } from '@/lib/types/feedbacks'
import type { SessionStatus } from '@/lib/types/sessions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'

interface PreSessionFeedbacksTableProps {
  sessionStatus: SessionStatus
}

export const PreSessionFeedbacksTable = ({ sessionStatus }: PreSessionFeedbacksTableProps) => {
  const [filterDuplicates, setFilterDuplicates] = useState(false)
  const searchParams = useSearchParams()
  const receiverFilter = searchParams.get('receiver')

  // Mock data - da sostituire con dati reali dal backend
  const feedbacks: Feedback[] = [
    {
      id: '1',
      sender: 'William Zisa',
      receiver: 'Nicola Violante',
      question: 'Come valuti la capacità di problem solving?',
      tags: ['Problem Solving', 'Execution'],
      rule: 1,
    },
    {
      id: '2',
      sender: 'Alessandro Cinus',
      receiver: 'Nicola Violante',
      question: 'Quanto è efficace nella comunicazione con il team?',
      tags: ['Comunicazione', 'Soft Skills'],
      rule: 2,
    },
    {
      id: '3',
      sender: 'Marco Rossi',
      receiver: 'William Zisa',
      question: 'Come valuti la capacità di pianificazione strategica?',
      tags: ['Strategia', 'Planning'],
      rule: 1,
    },
    {
      id: '4',
      sender: 'Laura Bianchi',
      receiver: 'William Zisa',
      question: 'Quanto è efficace nel guidare il team verso gli obiettivi?',
      tags: ['Leadership', 'Soft Skills'],
      rule: 2,
    },
    {
      id: '5',
      sender: 'Nicola Violante',
      receiver: 'Marco Rossi',
      question: 'Come valuti la qualità delle soluzioni tecniche proposte?',
      tags: ['Technical Skills', 'Execution'],
      rule: 1,
    },
    {
      id: '6',
      sender: 'William Zisa',
      receiver: 'Laura Bianchi',
      question: 'Quanto è efficace nella gestione delle priorità?',
      tags: ['Time Management', 'Execution'],
      rule: 3,
    },
    {
      id: '7',
      sender: 'Alessandro Cinus',
      receiver: 'William Zisa',
      question: 'Come valuti la capacità di mentoring verso i colleghi junior?',
      tags: ['Mentoring', 'Soft Skills'],
      rule: 2,
    }
  ]

  // Filtra i feedback in base ai parametri URL
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (receiverFilter && feedback.receiver !== receiverFilter) {
      return false
    }
    // Qui andrebbe aggiunto il filtro per sessione quando avremo il campo session nei feedback
    return true
  })

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
          {sessionStatus === 'preparation' && (
            <div className="flex items-center h-10 space-x-2 whitespace-nowrap">
              <Checkbox 
                id="filterDuplicates" 
                checked={filterDuplicates}
                onCheckedChange={(checked) => setFilterDuplicates(checked as boolean)}
              />
              <Label htmlFor="filterDuplicates" className="leading-none">Filtra duplicati</Label>
            </div>
          )}
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
          <div key={feedback.id} className="mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
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
                    <div className="mt-1">{feedback.question}</div>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Regola:</span> {feedback.rule}
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
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
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
                <TableHead>ID FEEDBACK</TableHead>
                <TableHead>MITTENTE</TableHead>
                <TableHead>DESTINATARIO</TableHead>
                <TableHead>DOMANDA</TableHead>
                <TableHead>REGOLA</TableHead>
                <TableHead>TAG</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.id}</TableCell>
                  <TableCell>{feedback.sender}</TableCell>
                  <TableCell>{feedback.receiver}</TableCell>
                  <TableCell className="max-w-md truncate">{feedback.question}</TableCell>
                  <TableCell>{feedback.rule}</TableCell>
                  <TableCell>
                    <div 
                      className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                      title={feedback.tags.join(', ')}
                    >
                      {feedback.tags.length} tag{feedback.tags.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
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