'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"
import { Session } from "@/lib/types/sessions"

interface GenerateFeedbackDialogProps {
  sessionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (ruleId: string) => void
  generatedRules: string[]
}

export function GenerateFeedbackDialog({
  sessionId,
  open,
  onOpenChange,
  onSuccess,
  generatedRules = []
}: GenerateFeedbackDialogProps) {
  const [selectedRule, setSelectedRule] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ottieni l'utente corrente
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  });

  // Ottieni la sessione corrente
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['sessions', currentUser?.company],
    queryFn: () => {
      if (!currentUser?.company) throw new Error('Company non disponibile');
      return queries.sessions.getByCompany(currentUser.company);
    },
    enabled: !!currentUser?.company
  });

  const session = sessions?.find(s => s.id === sessionId);
  
  // Ottieni le regole disponibili per la company
  const { data: rules = [] } = useQuery({
    queryKey: ['rules', currentUser?.company],
    queryFn: () => {
      if (!currentUser?.company) throw new Error('Company non disponibile');
      return queries.rules.getByCompany(currentUser.company);
    },
    enabled: !!currentUser?.company
  });
  
  // Filtra le regole disponibili (solo quelle della sessione e non ancora generate)
  const sessionRules = session?.session_rules?.map(sr => sr.rule?.id) || [];
  const availableRules = rules
    .filter(rule => sessionRules.includes(rule.id) && !generatedRules.includes(rule.id));

  const handleGenerate = async () => {
    if (!selectedRule) {
      setError("Seleziona una regola")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // TODO: Implementare la generazione dei feedback per la regola selezionata
      // await queries.feedbacks.generateForRule(sessionId, selectedRule);

      onSuccess(selectedRule)
      onOpenChange(false)
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la generazione dei feedback')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Genera Feedback</DialogTitle>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Select
              value={selectedRule}
              onValueChange={setSelectedRule}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una regola" />
              </SelectTrigger>
              <SelectContent>
                {availableRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {availableRules.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Tutte le regole sono state già generate per questa sessione.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !selectedRule || availableRules.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione...
                </>
              ) : (
                'Genera'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 