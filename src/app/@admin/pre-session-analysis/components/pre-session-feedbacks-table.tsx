'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, FileDown, Trash2 } from 'lucide-react'
import { Feedback } from '@/lib/types/feedbacks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useQueryClient } from '@tanstack/react-query'
import { queries } from '@/lib/supabase/queries'
import { toast } from 'sonner'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface PreSessionFeedbacksTableProps {
  sessionId: string;
  feedbacks: Feedback[];
}

const ITEMS_PER_PAGE = 50;

// Funzione per convertire i feedback in CSV
const exportToCSV = (feedbacks: Feedback[]) => {
  const headers = ['ID FEEDBACK', 'MITTENTE', 'DESTINATARIO', 'DOMANDA', 'TYPE', 'REGOLA', 'TAG'];
  const csvContent = [
    headers.join(','),
    ...feedbacks.map(feedback => [
      feedback.id,
      `"${feedback.sender}"`,
      `"${feedback.receiver}"`,
      `"${feedback.question}"`,
      `"${feedback.questionType.toLowerCase()}"`,
      feedback.rule_number || '',
      `"${feedback.tags.join(', ')}"`,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'feedback_export.csv';
  link.click();
};

// Funzione per convertire i feedback in XLSX
const exportToXLSX = async (feedbacks: Feedback[]) => {
  try {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(feedbacks.map(feedback => ({
      'ID FEEDBACK': feedback.id,
      'MITTENTE': feedback.sender,
      'DESTINATARIO': feedback.receiver,
      'DOMANDA': feedback.question,
      'TYPE': feedback.questionType.toLowerCase(),
      'REGOLA': feedback.rule_number || '',
      'TAG': feedback.tags.join(', ')
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');
    XLSX.writeFile(workbook, 'feedback_export.xlsx');
  } catch (error) {
    console.error('Errore durante l\'esportazione XLSX:', error);
    toast.error('Errore durante l\'esportazione in Excel');
  }
};

export function PreSessionFeedbacksTable({ sessionId, feedbacks }: PreSessionFeedbacksTableProps) {
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

  const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  // Notifica il parent component dei dati filtrati solo quando cambiano i filtri o i feedback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Funzione per trovare i feedback duplicati
      const findDuplicates = (feedbacks: Feedback[]): Set<string> => {
        const feedbackMap = new Map<string, { count: number; ids: string[] }>();
        const duplicateIds = new Set<string>();

        // Prima passata: raggruppa i feedback e conta le occorrenze
        feedbacks.forEach(feedback => {
          // Rimuovo rule_number dalla chiave per identificare i veri duplicati
          const key = `${feedback.sender}-${feedback.receiver}-${feedback.question}`;
          if (!feedbackMap.has(key)) {
            feedbackMap.set(key, { count: 0, ids: [] });
          }
          const entry = feedbackMap.get(key)!;
          entry.count++;
          entry.ids.push(feedback.id);
        });

        // Seconda passata: aggiungi gli ID dei feedback che sono effettivamente duplicati
        feedbackMap.forEach(({ count, ids }) => {
          if (count > 1) {
            ids.forEach(id => duplicateIds.add(id));
          }
        });

        return duplicateIds;
      };

      let filtered = feedbacks;

      // Applica i filtri di ricerca
      if (senderFilter || receiverFilter || questionFilter || typeFilter !== 'all' || ruleFilter !== 'all') {
        filtered = feedbacks.filter(feedback => {
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
          return true;
        });
      }

      // Se il filtro duplicati è attivo, mostra solo i feedback che hanno duplicati
      if (filterDuplicates) {
        const duplicateIds = findDuplicates(filtered);
        filtered = filtered.filter(feedback => duplicateIds.has(feedback.id));
      }

      setFilteredResults(filtered);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [
    feedbacks,
    senderFilter,
    receiverFilter,
    questionFilter,
    typeFilter,
    ruleFilter,
    filterDuplicates
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

  // Funzione per gestire la selezione di tutti i feedback
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(filteredResults.map(f => f.id));
      setSelectedFeedbacks(newSelected);
    } else {
      setSelectedFeedbacks(new Set());
    }
  };

  // Funzione per gestire la selezione singola
  const handleSelect = (feedbackId: string, checked: boolean) => {
    const newSelected = new Set(selectedFeedbacks);
    if (checked) {
      newSelected.add(feedbackId);
    } else {
      newSelected.delete(feedbackId);
    }
    setSelectedFeedbacks(newSelected);
  };

  // Funzione per eliminare i feedback selezionati
  const deleteSelectedFeedbacks = async () => {
    try {
      const MAX_DELETIONS = 1000;
      const selectedArray = Array.from(selectedFeedbacks);
      
      if (selectedArray.length > MAX_DELETIONS) {
        const shouldLimit = window.confirm(
          `Non è possibile eliminare più di ${MAX_DELETIONS} feedback contemporaneamente. ` +
          `Vuoi selezionare automaticamente i primi ${MAX_DELETIONS} feedback?`
        );
        
        if (shouldLimit) {
          // Seleziona solo i primi 1000 feedback
          const limitedSelection = new Set(selectedArray.slice(0, MAX_DELETIONS));
          setSelectedFeedbacks(limitedSelection);
          // Non chiudere il dialog in questo caso
          return;
        } else {
          setShowDeleteDialog(false);
          return;
        }
      }

      // Procedi con l'eliminazione
      await Promise.all(selectedArray.map(id => 
        queries.feedbacks.delete(id)
      ));
      
      // Aggiorna la cache e resetta la selezione
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', sessionId] });
      setSelectedFeedbacks(new Set());
      toast.success('Feedback eliminati con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione dei feedback:', error);
      toast.error('Errore nell\'eliminazione dei feedback');
    } finally {
      setShowDeleteDialog(false);
    }
  };

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
        <div className="flex gap-2">
          {selectedFeedbacks.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina selezionati ({selectedFeedbacks.size})
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
                <FileDown className="mr-2 h-4 w-4" />
                Esporta
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportToCSV(filteredResults)}>
                Esporta CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToXLSX(filteredResults)}>
                Esporta Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog di conferma eliminazione */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare {selectedFeedbacks.size} feedback? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={deleteSelectedFeedbacks}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Vista Desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="rounded-md border min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedFeedbacks.size === filteredResults.length && filteredResults.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>ID FEEDBACK</TableHead>
                <TableHead>MITTENTE</TableHead>
                <TableHead>DESTINATARIO</TableHead>
                <TableHead>DOMANDA</TableHead>
                <TableHead>REGOLA</TableHead>
                <TableHead>TAG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFeedbacks.map((feedback, index) => (
                <TableRow key={`${feedback.id}-${index}`}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedFeedbacks.has(feedback.id)}
                      onCheckedChange={(checked) => handleSelect(feedback.id, checked as boolean)}
                    />
                  </TableCell>
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

      {/* Vista Mobile */}
      <div className="block sm:hidden space-y-4">
        {paginatedFeedbacks.map((feedback, index) => (
          <div 
            key={`${feedback.id}-${index}`} 
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedFeedbacks.has(feedback.id)}
                  onCheckedChange={(checked) => handleSelect(feedback.id, checked as boolean)}
                />
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
} 