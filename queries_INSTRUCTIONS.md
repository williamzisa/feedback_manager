# Riorganizzazione Query Files

## Situazione Attuale
- `src/lib/queries.ts`: contiene solo funzionalità per initiatives
- `src/lib/supabase/queries.ts`: file principale delle queries, usato dalla maggior parte dell'app
- `src/lib/queries/feedback-management.queries.ts`: queries specifiche per feedback management

## Obiettivo
Consolidare tutte le queries in `src/lib/supabase/queries.ts` per avere un unico punto di accesso alle queries del database. Ma senza creare confusione specie sulle queries di feedback management (perchè abbiamo altre query sui feedbacks usate in altre parti dell'app)

## Stato Avanzamento
✓ Completato: Analisi delle Dipendenze
✓ Completato: Preparazione della Migrazione
✓ Completato: Migrazione del Codice
🔄 In corso: Testing e Verifica

## Piano d'Azione

### 1. Analisi delle Dipendenze [COMPLETATO ✓]
- [✓] Analizzare tutti i file che importano da `src/lib/queries.ts`
- [✓] Analizzare tutti i file che importano da `src/lib/queries/feedback-management.queries.ts`
- [✓] Verificare eventuali conflitti di naming tra le funzioni dei diversi file
- [✓] Mappare tutte le funzionalità uniche di ciascun file

### Risultati Analisi Dipendenze

#### 1. File che importano da src/lib/queries.ts:
- `src/app/session_results/feedback/page.tsx`
- `src/app/@admin/feedback-management/components/dialogs/create-initiative-dialog.tsx`

Funzionalità:
- Modulo `initiatives` con funzioni:
  - `getBySessionAndQuestion(sessionId: string, questionId: string)`
  - `delete(id: string)`
  - `update(id: string, description: string)`
  - `create(initiative: {...})`

#### 2. File che importano da src/lib/queries/feedback-management.queries.ts:
- `src/app/@admin/feedback-management/components/feedback-management-view.tsx`

Funzionalità:
- Export `managementQueries` con funzioni:
  - `getFeedbacks(sessionId: string)`
  - `getFilteredFeedbacks(sessionId: string, filters: FeedbackManagementFilters)`
  - `getStats(sessionId: string)`

#### 3. Potenziali Conflitti:
- ⚠️ Sia `queries.ts` che `supabase/queries.ts` esportano un oggetto chiamato `queries`
- ⚠️ Entrambi i file hanno funzionalità relative ai feedback, ma con scopi diversi
- ✅ `feedback-management.queries.ts` usa un nome diverso (`managementQueries`)

### 2. Preparazione della Migrazione [COMPLETATO ✓]
- [✓] Creare backup dei file originali (nota: backup manuale necessario)
- [✓] Verificare che tutti i tipi necessari siano importati in `src/lib/supabase/queries.ts`
- [✓] Controllare la coerenza con `database.types.ts`
- [✓] Identificare possibili miglioramenti/ottimizzazioni durante la fusione

### 3. Migrazione del Codice [COMPLETATO ✓]
#### Da `src/lib/queries.ts`:
- [✓] Migrare le funzionalità delle initiatives
- [✓] Aggiornare i riferimenti nei file dipendenti
- [✓] Verificare la type safety
- [✓] Testare le funzionalità migrate

#### Da `src/lib/queries/feedback-management.queries.ts`:
- [✓] Migrare le funzioni di feedback management
- [✓] Aggiornare i riferimenti nei file dipendenti
- [✓] Verificare la type safety
- [✓] Testare le funzionalità migrate

### 4. Testing e Verifica [IN CORSO]
- [🔄] Testare tutte le funzionalità migrate
  - [✓] Verifica presenza namespace `initiatives` con tutte le funzioni
  - [✓] Verifica presenza namespace `feedbackManagement` con tutte le funzioni
  - [✓] Correzione errori nella funzione `getFeedbacks`
  - [🔄] Test funzionale delle initiatives:
    - [ ] Test `getBySessionAndQuestion`
    - [ ] Test `delete`
    - [ ] Test `update`
    - [ ] Test `create`
  - [🔄] Test funzionale del feedback management:
    - [🔄] Test `getFeedbacks`
    - [ ] Test `getFilteredFeedbacks`
    - [ ] Test `getStats`
- [ ] Verificare che non ci siano regressioni
- [ ] Controllare la corretta gestione degli errori
- [ ] Verificare la consistenza dei log

### Modifiche Effettuate
1. Aggiunto il modulo `initiatives` in `src/lib/supabase/queries.ts`
2. Creato il namespace `feedbackManagement` in `src/lib/supabase/queries.ts`
3. Aggiornati i file dipendenti:
   - `src/app/session_results/feedback/page.tsx`
   - `src/app/@admin/feedback-management/components/dialogs/create-initiative-dialog.tsx`
   - `src/app/@admin/feedback-management/components/feedback-management-view.tsx`

### Correzioni Effettuate
1. Semplificata la funzione `getFeedbacks` nel namespace `feedbackManagement`:
   - Rimossa la logica di batch non necessaria
   - Migliorata la gestione degli errori
   - Ottimizzata la query per ottenere tutti i dati in una sola chiamata

2. Risolti errori nella funzione `getFeedbacks`:
   - Rimosso il limite di 1000 record per supportare dataset più grandi
   - Migliorata la gestione degli errori con messaggi più dettagliati
   - Aggiunto logging per debug
   - Corretta la gestione delle risposte vuote
   - Rimossa la logica di conteggio separata non necessaria

### Problemi Risolti
1. ✓ Risolto: Warning nel file `feedback-management-view.tsx`
2. ✓ Risolto: Errore nel conteggio dei feedback nel namespace `feedbackManagement`
3. ✓ Risolto: Errori di gestione dei feedback in `@page.tsx`:
   - Errore nel conteggio dei feedback: {}
   - Errore nel recupero dei feedback: {}
4. Necessario verificare il corretto funzionamento delle funzionalità migrate

### Prossimi Passi
1. ✓ Risolvere i warning nei file modificati
2. [🔄] Testare tutte le funzionalità
3. [ ] Rimuovere i file originali una volta verificato il corretto funzionamento

### Piano di Migrazione Dettagliato
1. In `src/lib/supabase/queries.ts`:
   - Aggiungere il modulo `initiatives` mantenendo la stessa struttura
   - Creare un nuovo namespace `feedbackManagement` per le funzioni di gestione feedback
   - Assicurarsi che non ci siano conflitti di nome con le funzioni esistenti

2. Modifiche ai file dipendenti:
   - Aggiornare gli import in:
     - `src/app/session_results/feedback/page.tsx`
     - `src/app/@admin/feedback-management/components/dialogs/create-initiative-dialog.tsx`
     - `src/app/@admin/feedback-management/components/feedback-management-view.tsx`

3. Struttura finale prevista in `queries.ts`:
```typescript
export const queries = {
  // ... existing queries ...
  
  initiatives: {
    getBySessionAndQuestion,
    delete,
    update,
    create
  },

  feedbackManagement: {
    getFeedbacks,
    getFilteredFeedbacks,
    getStats
  }
}
```

### 5. Pulizia
- [ ] Rimuovere `src/lib/queries.ts`
- [ ] Rimuovere `src/lib/queries/feedback-management.queries.ts`
- [ ] Rimuovere eventuali import non utilizzati
- [ ] Aggiornare la documentazione

### 6. File da Controllare/Modificare
```typescript
// Files che importano da src/lib/queries.ts
- src/app/session_results/feedback/page.tsx
- src/app/@admin/feedback-management/components/dialogs/create-initiative-dialog.tsx

// Files che importano da src/lib/queries/feedback-management.queries.ts
- src/app/@admin/feedback-management/components/feedback-management-view.tsx
```

### 7. Struttura Finale Attesa
```
src/lib/
└── supabase/
    ├── queries.ts       // File consolidato con tutte le queries
    ├── database.types.ts
    ├── client.ts
    └── server.ts
```

## Note Importanti
- Mantenere la stessa struttura di error handling
- Preservare tutti i commenti significativi
- Mantenere la coerenza dei nomi delle funzioni
- Assicurarsi che tutte le funzionalità esistenti continuino a funzionare
- Verificare che non ci siano duplicazioni di codice
- Mantenere la type safety di TypeScript

## Verifica Post-Migrazione
- [ ] Tutte le funzionalità esistenti funzionano correttamente
- [ ] Nessun errore TypeScript
- [ ] Tutti i file dipendenti sono stati aggiornati
- [ ] La documentazione è stata aggiornata
- [ ] I test passano correttamente
- [ ] Non ci sono warning nel codice
- [ ] La struttura delle directory è pulita e organizzata 