# Documentazione Feedback System

## Struttura del Sistema
```
src/lib/
|-- queries/
|   |-- pre-session.queries.ts         # Query per l'analisi pre-sessione
|   |-- feedback-management.queries.ts  # Query per la gestione feedback
|
|-- types/
|   |-- feedback.types.ts              # Tipi base condivisi
|   |-- pre-session.types.ts           # Tipi specifici pre-session
|   |-- feedback-management.types.ts    # Tipi specifici management
|
|-- query-keys.ts                      # Query keys centralizzate
```

## Tipi Base (feedback.types.ts)
```typescript
// Tipo base per tutti i feedback
export type BaseFeedback = {
  id: string;
  value: number | null;
  comment: string | null;
  session_id: string;
  rule_number: number | null;
}

// Enums condivisi
export enum FeedbackType {
  SOFT = 'SOFT',
  EXECUTION = 'EXECUTION',
  STRATEGY = 'STRATEGY'
}

export enum SessionStatus {
  PREPARATION = 'In preparazione',
  ACTIVE = 'In corso',
  COMPLETED = 'Conclusa'
}
```

## Pre-Session Analysis

### Tipi (pre-session.types.ts)
```typescript
export type PreSessionFeedback = BaseFeedback & {
  sender: string;
  receiver: string;
  question: string;
  questionType: FeedbackType;
  tags: string[];
}

export interface PreSessionAnalysisStats {
  totalPendingFeedbacks: number;
  feedbacksByRule: Array<{ ruleNumber: number; count: number }>;
  feedbacksByType: Array<{ type: FeedbackType; count: number }>;
}
```

### Query (pre-session.queries.ts)
- **getFeedbacks(sessionId)**: Recupera feedback per sessione in preparazione
- **getStats(sessionId)**: Statistiche per sessione
- **generateFeedbacksForRule(sessionId, ruleNumber)**: Genera feedback per regola
- **removeDuplicates(sessionId)**: Rimuove feedback duplicati

### Componenti che utilizzano queste query
- `src/app/@admin/pre-session-analysis/components/pre-session-analysis-view.tsx`
  ```typescript
  const { data: feedbacks } = useQuery(
    queryKeys.preSession.feedbacks.bySession(sessionId),
    () => preSessionQueries.getFeedbacks(sessionId)
  );
  ```
- `src/app/@admin/pre-session-analysis/components/pre-session-feedbacks-table.tsx`

## Feedback Management

### Tipi (feedback-management.types.ts)
```typescript
export interface FeedbackUser {
  id: string;
  name: string;
  surname: string;
}

export interface FeedbackQuestion {
  id: string;
  description: string;
  type: FeedbackType;
}

export type ManagementFeedback = BaseFeedback & {
  sender: FeedbackUser;
  receiver: FeedbackUser;
  question: FeedbackQuestion;
}

export interface FeedbackManagementStats {
  totalResponses: number;
  responseRate: number;
  averageScore: number;
  feedbacksByType: Record<FeedbackType, number>;
}
```

### Query (feedback-management.queries.ts)
- **getFeedbacks(sessionId)**: Recupera feedback per sessione attiva
- **getFilteredFeedbacks(sessionId, filters)**: Recupera feedback filtrati
- **getStats(sessionId)**: Statistiche per sessione

### Componenti che utilizzano queste query
- `src/app/@admin/feedback-management/components/feedback-management-view.tsx`
  ```typescript
  const { data: feedbacks } = useQuery(
    queryKeys.management.feedbacks.bySession(sessionId),
    () => managementQueries.getFeedbacks(sessionId)
  );
  ```

## Query Keys Centralizzate (query-keys.ts)

```typescript
export const queryKeys = {
  // Keys per le sessioni
  sessions: {
    all: () => ['sessions'],
    byCompany: (company: string) => ['sessions', 'by-company', company]
  },

  // Keys per i feedback in pre-session
  preSession: {
    feedbacks: {
      bySession: (sessionId: string) => ['feedbacks', 'pre-session', sessionId],
      stats: (sessionId: string) => ['feedbacks', 'pre-session', 'stats', sessionId]
    }
  },

  // Keys per i feedback in management
  management: {
    feedbacks: {
      bySession: (sessionId: string) => ['feedbacks', 'management', sessionId],
      stats: (sessionId: string) => ['feedbacks', 'management', 'stats', sessionId]
    }
  }
}
```

## Best Practices

1. **Separazione dei Contesti**
   - Pre-session e management hanno query e tipi separati
   - Condividono solo i tipi base
   - Query keys specifiche per contesto

2. **Type Safety**
   - Tutti i tipi sono strettamente tipizzati
   - Enums per valori predefiniti
   - Interfacce per strutture dati complesse

3. **Query Organization**
   - Query raggruppate per contesto
   - Riutilizzo di logica comune
   - Gestione errori consistente

4. **Cache Management**
   - Query keys specifiche per contesto
   - Invalidazione cache precisa
   - Evita conflitti tra moduli

## Note di Implementazione

1. **Pre-Session Analysis**
   - Focus su generazione e validazione feedback
   - Statistiche orientate alla preparazione
   - Gestione regole e duplicati

2. **Feedback Management**
   - Focus su visualizzazione e filtri
   - Statistiche orientate all'analisi
   - Gestione relazioni utenti

## Migrazioni Future

1. **Materialized Views**
   ```sql
   CREATE MATERIALIZED VIEW management_feedbacks_view AS
   SELECT f.*, s.name as sender_name, r.name as receiver_name
   FROM feedbacks f
   JOIN users s ON f.sender = s.id
   JOIN users r ON f.receiver = r.id;
   ```

2. **Indici Performance**
   ```sql
   CREATE INDEX idx_feedbacks_session ON feedbacks(session_id);
   CREATE INDEX idx_feedbacks_type ON feedbacks(type);
   ```
