'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileEdit, ChevronLeft, ChevronRight } from 'lucide-react'
import { Feedback } from '@/lib/types/feedbacks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { queries } from '@/lib/supabase/queries'

interface PreSessionFeedbacksTableProps {
  sessionId: string;
  onFilteredDataChange?: (filteredData: Feedback[]) => void;
}

const ITEMS_PER_PAGE = 50;

export const PreSessionFeedbacksTable = ({ sessionId, onFilteredDataChange }: PreSessionFeedbacksTableProps) => {
  // Filtri
  const [senderFilter, setSenderFilter] = useState('')
  const [receiverFilter, setReceiverFilter] = useState('')
  const [questionFilter, setQuestionFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [ruleFilter, setRuleFilter] = useState<string>('all')
  const [filterDuplicates, setFilterDuplicates] = useState(false)
  const [filteredResults, setFilteredResults] = useState<Feedback[]>([])
  
  // Paginazione
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Ottieni i feedback per la sessione corrente
  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ['feedbacks', sessionId],
    queryFn: async () => {
      const result = await queries.feedbacks.getBySession(sessionId);
      return result;
    },
    enabled: !!sessionId
  });

  // Notifica il parent component dei dati filtrati solo quando cambiano i filtri o i feedback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const findDuplicates = (feedbacks: Feedback[]): Set<string> => {
        const feedbackMap = new Map<string, { count: number; ids: string[] }>();
        const duplicateIds = new Set<string>();

        // Prima passata: raggruppa i feedback e conta le occorrenze
        feedbacks.forEach(feedback => {
          const key = `${feedback.sender}-${feedback.receiver}-${feedback.question}`;
          if (!feedbackMap.has(key)) {
            feedbackMap.set(key, { count: 0, ids: [] });
          }
          const entry = feedbackMap.get(key)!;
          entry.count++;
          entry.ids.push(feedback.id);
        });

        // Seconda passata: aggiungi tutti gli ID dei feedback che hanno duplicati
        feedbackMap.forEach(({ count, ids }) => {
          if (count > 1) {
            ids.forEach(id => duplicateIds.add(id));
          }
        });

        return duplicateIds;
      };

      const filtered = feedbacks.filter(feedback => {
        if (senderFilter && !feedback.sender.toLowerCase().includes(senderFilter.toLowerCase())) {
          return false;
        }
        if (receiverFilter && !feedback.receiver.toLowerCase().includes(receiverFilter.toLowerCase())) {
          return false;
        }
        if (questionFilter && !feedback.question.toLowerCase().includes(questionFilter.toLowerCase())) {
          return false;
        }
        if (typeFilter !== 'all' && feedback.questionType.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
        if (ruleFilter !== 'all') {
          if (ruleFilter === 'no_rule' && feedback.rule_number !== null) {
            return false;
          } else if (ruleFilter !== 'no_rule' && feedback.rule_number !== Number(ruleFilter)) {
            return false;
          }
        }
        if (filterDuplicates) {
          const duplicateIds = findDuplicates(feedbacks);
          return duplicateIds.has(feedback.id);
        }
        return true;
      });

      setFilteredResults(filtered);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setCurrentPage(1); // Reset to first page when filters change
      onFilteredDataChange?.(filtered);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [
    feedbacks,
    senderFilter,
    receiverFilter,
    questionFilter,
    typeFilter,
    ruleFilter,
    filterDuplicates,
    onFilteredDataChange
  ]);

  // Reset dei filtri quando cambia la sessione
  useEffect(() => {
    setSenderFilter('');
    setReceiverFilter('');
    setQuestionFilter('');
    setTypeFilter('all');
    setRuleFilter('all');
    setFilterDuplicates(false);
    setCurrentPage(1);
  }, [sessionId]);

  // Calcola i feedback da mostrare nella pagina corrente
  const paginatedFeedbacks = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

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
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
          />
          <Input
            placeholder="Cerca Destinatario"
            className="w-full sm:w-auto bg-white"
            value={receiverFilter}
            onChange={(e) => setReceiverFilter(e.target.value)}
          />
          <Input
            placeholder="Cerca Domanda"
            className="w-full sm:w-auto bg-white"
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Type domanda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="execution">Execution</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="soft">Soft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ruleFilter} onValueChange={setRuleFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Regola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="no_rule">Nessuna</SelectItem>
              <SelectItem value="1">Regola 1</SelectItem>
              <SelectItem value="2">Regola 2</SelectItem>
              <SelectItem value="3">Regola 3</SelectItem>
              <SelectItem value="4">Regola 4</SelectItem>
              <SelectItem value="5">Regola 5</SelectItem>
              <SelectItem value="6">Regola 6</SelectItem>
              <SelectItem value="7">Regola 7</SelectItem>
              <SelectItem value="8">Regola 8</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center h-10 space-x-2 whitespace-nowrap">
            <Checkbox 
              id="filterDuplicates" 
              checked={filterDuplicates}
              onCheckedChange={(checked) => {
                setFilterDuplicates(checked as boolean);
                if (checked) {
                  // Reset altri filtri quando si attiva il filtro duplicati
                  setSenderFilter('');
                  setReceiverFilter('');
                  setQuestionFilter('');
                  setTypeFilter('all');
                  setRuleFilter('all');
                }
              }}
            />
            <Label htmlFor="filterDuplicates" className="leading-none">Filtra duplicati</Label>
          </div>
        </div>
        <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
          Export .csv
        </Button>
      </div>

      <div className="flex items-center justify-between mt-6 mb-2">
        <div className="text-sm text-gray-500">
          {filteredResults.length} risultati totali - Pagina {currentPage} di {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {paginatedFeedbacks.map((feedback) => (
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
              {paginatedFeedbacks.map((feedback) => (
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
              {paginatedFeedbacks.length === 0 && (
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