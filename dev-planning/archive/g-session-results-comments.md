# Piano di Implementazione Revisionato: Session Results - Pagina Commenti

## Riferimenti

- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/queries.ts`
- `src/app/session_results/comment/page.tsx`
- Pagina sorgente dei link (probabilmente `src/app/session_results/feedback/page.tsx` o componenti figli)

## Obiettivo

Rifattorizzare la pagina dei commenti (`/session_results/comment`) per visualizzare i commenti relativi a una _specifica domanda_ (`questionId`), migliorare l'efficienza del data fetching filtrando i dati lato server (Supabase), correggere problemi di UI/UX (scroll, navigazione) e allinearsi alle best practice Next.js per la gestione dello stato tramite URL e componenti client.

## Task di Implementazione

### 1. Aggiornamento Data Fetching (`queries.ts`)

- **Modificare `getSessionComments`:**
  - Accettare `questionId: string` come nuovo argomento richiesto.
  - Aggiungere `.eq('question_id', questionId)` alla query Supabase per filtrare i feedback direttamente nel database, riducendo il carico di dati trasferiti.
  - Modificare la selezione per recuperare anche la descrizione della domanda specifica: `.select(\`..., question:questions(id, description)\`)`. Assicurarsi che il join funzioni correttamente per ottenere la descrizione associata a `questionId`.
  - Mantenere il filtro `.not('comment', 'is', null)`.
  - La funzione dovrebbe restituire un oggetto contenente sia la lista di commenti filtrati (`comments: Feedback[]`) sia i dettagli della domanda (`question: { id: string; description: string } | null`).

### 2. Rifattorizzazione Pagina Commenti (`comment/page.tsx`)

- **Gestione Parametri URL (Client Component):**
  - Utilizzare l'hook `useSearchParams` per leggere `sessionId`, `userId`, e `questionId` dall'URL.
  - Rimuovere completamente la logica relativa a `skill` (stato `selectedSkill`, lettura `initialSkill`, componente `Select`).
  - Aggiungere una validazione robusta all'inizio del componente per assicurarsi che tutti i parametri necessari (`sessionId`, `userId`, `questionId`) siano presenti. Se mancano, mostrare un messaggio di errore appropriato o reindirizzare l'utente.
- **Data Fetching (`useEffect`):**
  - Nell' `useEffect`, chiamare la funzione `getSessionComments` aggiornata, passando `sessionId`, `userId`, e `questionId`.
  - Gestire lo stato di caricamento (`isLoading`).
  - Salvare i commenti e i dettagli della domanda in stati separati (es. `useState<Feedback[]>([])` per i commenti, `useState<{ id: string; description: string } | null>(null)` per la domanda).
  - Implementare una gestione degli errori nel blocco `catch` (es. `setError(true)`), mostrando un messaggio all'utente in caso di fallimento del fetch.
- **Visualizzazione:**
  - Mostrare la `question.description` recuperata come titolo o intestazione della sezione commenti.
  - Renderizzare la lista dei `comments`.
  - Implementare uno **Stato Vuoto**: Se `!isLoading && !error && comments.length === 0`, mostrare un messaggio indicando che non ci sono commenti per quella domanda.
  - Implementare uno **Stato di Errore**: Se `error` è `true`, mostrare un messaggio di errore.
- **Componente `QuestionCommentsList` (Raccomandato):**
  - Estrarre la logica di rendering della lista dei commenti (inclusi i singoli item di commento) in un nuovo componente client per migliorare la leggibilità e la separazione delle preoccupazioni.

### 3. Aggiornamento Routing e Navigazione

- **Link alla Pagina Commenti:**
  - Identificare il componente (probabilmente all'interno della pagina feedback) che genera i link/pulsanti per visualizzare i commenti.
  - Aggiornare questi elementi (usando `<Link>` di `next/link`) per navigare a `/session_results/comment` passando i parametri corretti nell'URL: `sessionId`, `userId`, e `questionId`. Rimuovere il parametro `skill`.
- **Navigazione di Ritorno:**
  - Utilizzare l'hook `useRouter` da `next/navigation`.
  - Associare `router.back()` all'evento `onClick` del pulsante "Indietro". Questo approccio è semplice e mantiene il contesto di navigazione dell'utente.

### 4. Correzione Problemi UI/Layout e Stile

- **Problema di Scroll:**
  - Ispezionare il CSS della pagina `comment/page.tsx`, in particolare il `main` e il contenitore della lista commenti.
  - Assicurare che il contenitore della lista abbia `overflow-y: auto` e un'altezza massima definita (o che il layout flessibile permetta lo scroll) per gestire liste lunghe senza rompere il layout.
  - Verificare che `BottomNav` e il pulsante "Indietro" rimangano visibili e non vengano coperti dal contenuto scrollabile. Potrebbe essere necessario aggiustare `padding-bottom` del contenitore principale o usare `position: sticky` per il pulsante se il design lo richiede.
- **Stile e Responsività:**
  - Rivedere lo stile generale per coerenza con le altre pagine (colori, font, spaziatura).
  - Assicurare che la pagina sia completamente responsive e utilizzabile su dispositivi mobili.

### 5. Ottimizzazioni Aggiuntive (Considerazioni Future)

- **Paginazione/Virtualizzazione:** Se le performance diventano un problema a causa di un numero elevato di commenti per domanda, investigare l'implementazione della paginazione lato server (con Supabase `range()`) o della virtualizzazione della lista (es., `react-window`, `tanstack-virtual`).
- **Caching Dati:** Dato che la pagina dipende dai `searchParams`, rimarrà un Client Component con fetching dati in `useEffect`. Il caching server-side di Next.js non è direttamente applicabile qui.

### 6. Testing

- **Funzionale:** Verificare il corretto recupero e visualizzazione dei commenti per diverse domande e utenti. Testare lo stato vuoto e lo stato di errore.
- **Navigazione:** Testare i link dalla pagina feedback e il funzionamento del pulsante "Indietro".
- **UI/UX:** Controllare layout, scroll, e responsività su diverse dimensioni di schermo (desktop, tablet, mobile) e con diverse quantità di commenti (0, pochi, molti).
- **Performance:** Monitorare i tempi di caricamento, specialmente con molti commenti (se applicabile).
