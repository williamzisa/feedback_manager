# Pre-Session Analysis

## Struttura Effettiva
```
src/lib/
|-- supabase/
|   |-- queries.ts                     # Query base con tutte le funzioni
|   |-- database.types.ts              # Tipi del database Supabase
|
|-- types/
|   |-- feedbacks.ts                   # Tipi base per i feedback
|   |-- sessions.ts                    # Tipi per le sessioni
```

## Query Implementation (queries.ts)
La query che funziona correttamente e supera il limite di 1000 record:

```typescript
export const queries = {
  feedbacks: {
    getBySession: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          id,
          value,
          comment,
          session_id,
          rule_number,
          sender:users!feedbacks_sender_fkey (name, surname),
          receiver:users!feedbacks_receiver_fkey (name, surname),
          questions (description, type)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      if (!data) return [];

      return data.map(feedback => ({
        id: feedback.id,
        value: feedback.value,
        comment: feedback.comment,
        session_id: feedback.session_id,
        rule_number: feedback.rule_number,
        sender: `${feedback.sender?.name} ${feedback.sender?.surname}`,
        receiver: `${feedback.receiver?.name} ${feedback.receiver?.surname}`,
        question: feedback.questions?.description || '',
        questionType: feedback.questions?.type
      }));
    }
  }
}
```

## Punti Chiave
1. La query usa una singola chiamata con join tramite la sintassi di Supabase
2. Non usa `.range()` o limiti, permettendo di recuperare tutti i record
3. I join sono fatti direttamente nella query
4. La paginazione è gestita lato client nel componente tabella
5. I filtri sono applicati in memoria

## Componenti
- `pre-session-analysis-view.tsx`: Vista principale che usa direttamente `queries.feedbacks.getBySession`
- `pre-session-feedbacks-table.tsx`: Tabella che gestisce paginazione e filtri client-side