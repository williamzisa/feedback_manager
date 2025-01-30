import { Session } from '@/lib/types/sessions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, ArrowRight, StopCircle } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from 'react'
import { queries } from '@/lib/supabase/queries'

interface SessionsTableProps {
  sessions: Session[]
  onEdit: (session: Session) => void
}

export function SessionsTable({ sessions, onEdit }: SessionsTableProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    session: Session | null;
  }>({ open: false, session: null });

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('it-IT')
  }

  const getClusterNames = (session: Session) => {
    return session.session_clusters
      ?.map(sc => sc.cluster.name)
      .join(', ') || '-'
  }

  const getRuleNames = (session: Session) => {
    return session.session_rules
      ?.map(sr => sr.rule.name)
      .join(', ') || '-'
  }

  const handleEndSession = async () => {
    if (!confirmDialog.session) return;
    
    try {
      // 1. Aggiorniamo lo stato della sessione a "Conclusa"
      await queries.sessions.update(confirmDialog.session.id, {
        name: confirmDialog.session.name,
        start_time: confirmDialog.session.start_time,
        end_time: confirmDialog.session.end_time,
        clusters: confirmDialog.session.session_clusters?.map(sc => sc.cluster.id) || [],
        rules: confirmDialog.session.session_rules?.map(sr => sr.rule.id) || [],
        status: 'Conclusa'
      });

      // 2. Generiamo gli user_sessions per questa sessione
      const result = await queries.sessions.generateUserSessions(confirmDialog.session.id);
      
      console.log('Risultato generazione user_sessions:', {
        numeroUtenti: result.length,
        esempio: result[0]
      });

      // Attendiamo 2 secondi per vedere i log
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Ricarica la pagina per mostrare i cambiamenti
      window.location.reload();
    } catch (error) {
      console.error('Errore durante la conclusione della sessione:', error);
      // TODO: Mostrare un toast di errore all'utente
    } finally {
      setConfirmDialog({ open: false, session: null });
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Nessuna sessione trovata
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Sessione</TableHead>
            <TableHead>Data Inizio</TableHead>
            <TableHead>Data Fine</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Cluster</TableHead>
            <TableHead>Regole</TableHead>
            <TableHead></TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>{session.name}</TableCell>
              <TableCell>{formatDate(session.start_time)}</TableCell>
              <TableCell>{formatDate(session.end_time)}</TableCell>
              <TableCell>{session.status}</TableCell>
              <TableCell>{getClusterNames(session)}</TableCell>
              <TableCell>{getRuleNames(session)}</TableCell>
              <TableCell className="text-right pr-2">
                {session.status === 'In preparazione' && (
                  <Link href={`/admin/pre-session-analysis?session=${session.id}`}>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
                      Impostazioni sessione
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
                {session.status === 'In corso' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2 text-sm text-red-600 hover:text-red-700"
                    onClick={() => setConfirmDialog({ open: true, session })}
                  >
                    Termina sessione
                    <StopCircle className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </TableCell>
              <TableCell className="w-[50px]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(session)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, session: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma conclusione sessione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler terminare la sessione &quot;{confirmDialog.session?.name}&quot;? 
              Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, session: null })}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleEndSession}>
              Termina Sessione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
