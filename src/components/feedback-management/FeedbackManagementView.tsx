'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SessionStatus } from "@/app/(routes)/admin/feedback-management/page"
import { useSearchParams } from 'next/navigation'

interface FeedbackManagementViewProps {
  sessionId: string
  sessionStatus: SessionStatus
}

interface Feedback {
  id: string
  sender: string
  receiver: string
  question: string
  tags: string[]
  vote: number | null
}

export default function FeedbackManagementView({ sessionId, sessionStatus }: FeedbackManagementViewProps) {
  const searchParams = useSearchParams()
  const receiverFilter = searchParams.get('receiver')
  
  // Stati per i filtri
  const [senderSearch, setSenderSearch] = useState("")
  const [receiverSearch, setReceiverSearch] = useState(receiverFilter || "")
  const [questionSearch, setQuestionSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")

  // Mock data - da sostituire con dati reali dal backend
  const feedbacks: Feedback[] = [
    {
      id: '1',
      sender: 'William Zisa',
      receiver: 'Nicola Violante',
      question: 'Come valuti la capacità di problem solving?',
      tags: ['Problem Solving', 'Execution'],
      vote: 4,
    },
    {
      id: '2',
      sender: 'Alessandro Cinus',
      receiver: 'Nicola Violante',
      question: 'Quanto è efficace nella comunicazione con il team?',
      tags: ['Comunicazione', 'Soft Skills'],
      vote: null,
    },
    // Altri feedback simulati...
  ]

  // Filtra i feedback in base ai filtri
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSender = feedback.sender.toLowerCase().includes(senderSearch.toLowerCase())
    const matchesReceiver = feedback.receiver.toLowerCase().includes(receiverSearch.toLowerCase())
    const matchesQuestion = feedback.question.toLowerCase().includes(questionSearch.toLowerCase())
    const matchesType = !selectedType || feedback.tags.some(tag => tag.toLowerCase().includes(selectedType.toLowerCase()))

    return matchesSender && matchesReceiver && matchesQuestion && matchesType
  })

  // Funzione per esportare in CSV
  const handleExportCsv = () => {
    // Implementare l'esportazione CSV
    console.log('Esportazione CSV per la sessione:', sessionId)
  }

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
          <Input
            placeholder="Cerca Mittente"
            className="w-full sm:w-auto bg-white"
            value={senderSearch}
            onChange={(e) => setSenderSearch(e.target.value)}
          />
          <Input
            placeholder="Cerca Destinatario"
            className="w-full sm:w-auto bg-white"
            value={receiverSearch}
            onChange={(e) => setReceiverSearch(e.target.value)}
          />
          <Input
            placeholder="Cerca Domanda"
            className="w-full sm:w-auto bg-white"
            value={questionSearch}
            onChange={(e) => setQuestionSearch(e.target.value)}
          />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Type domanda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Soft</SelectItem>
              <SelectItem value="execution">Execution</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={handleExportCsv}
          disabled={sessionStatus === 'completed'}
        >
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
                    <span className="font-medium">Voto:</span>
                    {feedback.vote !== null ? (
                      <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {feedback.vote}/5
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-400">In attesa</span>
                    )}
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
                <TableHead>VOTO</TableHead>
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
                  <TableCell>
                    {feedback.vote !== null ? (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {feedback.vote}/5
                      </span>
                    ) : (
                      <span className="text-gray-400">In attesa</span>
                    )}
                  </TableCell>
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
    </div>
  )
} 