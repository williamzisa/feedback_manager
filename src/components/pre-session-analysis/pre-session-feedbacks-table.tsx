'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit } from 'lucide-react'
import { Feedback } from '@/lib/types/feedbacks'
import type { SessionStatus } from '@/app/(routes)/admin/pre-session-analysis/page'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PreSessionFeedbacksTableProps {
  sessionStatus: SessionStatus
}

export const PreSessionFeedbacksTable = ({ sessionStatus }: PreSessionFeedbacksTableProps) => {
  const [filterDuplicates, setFilterDuplicates] = useState(false)

  // Mock data - da sostituire con dati reali dal backend
  const feedbacks: Feedback[] = [
    {
      id: '1',
      sender: 'William Zisa',
      receiver: 'Nicola Violante',
      question: 'Aliquip nisi qui excepteur esse commodo incididunt et nisi id cillum',
      tags: ['New tag'],
      rule: 1,
    },
    {
      id: '2',
      sender: 'Alessandro Cinus',
      receiver: 'Nicola Violante',
      question: 'Id aute do incididunt ea duis magna enim pariatur mollit adipisicing',
      tags: ['New tag', 'New tag'],
      rule: 2,
    },
    // ... altri feedback
  ]

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
              <SelectItem value="type1">Type 1</SelectItem>
              <SelectItem value="type2">Type 2</SelectItem>
              <SelectItem value="type3">Type 3</SelectItem>
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
        {feedbacks.length} risultati
      </div>

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {feedbacks.map((feedback) => (
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {feedback.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
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
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{feedback.id}</TableCell>
                  <TableCell>{feedback.sender}</TableCell>
                  <TableCell>{feedback.receiver}</TableCell>
                  <TableCell className="max-w-md truncate">{feedback.question}</TableCell>
                  <TableCell>{feedback.rule}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {feedback.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {feedbacks.length === 0 && (
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