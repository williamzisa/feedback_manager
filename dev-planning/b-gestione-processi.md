# Piano di Implementazione: Gestione Processi (Vista Utente)

## Riferimenti Generali

- **Tipi DB**: `src/lib/supabase/database.types.ts` (Tabelle: `processes`, `questions`, `teams`, `user_teams`, `team_processes`, `user_processes`)
- **Query Supabase**: `src/lib/supabase/queries.ts`
- **Tipi Applicazione**: `src/lib/types/` (Creare/aggiornare `processes.ts` se necessario)

## Riferimenti Specifici (Esempi UI/Logica)

- **Admin View**: `src/app/@admin/processes/components/processes-view.tsx`
- **Admin Table**: `src/app/@admin/processes/components/processes-table.tsx`
- **Homepage**: `src/app/page.tsx`
- **Navigazione**: `src/components/navigation/header.tsx`, `src/components/navigation/user-menu.tsx`

## Task di Implementazione

### 1. Setup Pagina e Navigazione

- **Route**: Creare `src/app/processes/page.tsx` come React Server Component (RSC).
- **Navigazione**: Aggiungere link "I miei Processi" in `src/components/navigation/user-menu.tsx`.
- **Layout Base**: Strutturare `page.tsx` con `<Header>` e un componente contenitore principale `UserProcessesView` (RSC).

### 2. Query Dati Utente Specifici

- **`queries.ts`**: Implementare una nuova funzione (es. `getUserAccessibleProcesses`) che recuperi:
  - I processi direttamente assegnati all'utente (`user_processes`).
  - I processi associati ai team di cui l'utente è membro (`user_teams` -> `teams` -> `team_processes` -> `processes`).
  - Utilizzare `select` specifici e join ottimizzati per efficienza.
  - Recuperare dati correlati necessari (es. `questions.description`).
  - Garantire il filtraggio per `company` dell'utente loggato.
- **Type Safety**: Utilizzare i tipi generati da `database.types.ts` e definire interfacce chiare per i dati restituiti.

### 3. Visualizzazione Processi Accessibili (`UserProcessesView`)

- **Componente (RSC)**: Sviluppare `src/app/processes/components/user-processes-view.tsx`.
- **Data Fetching**: Invocare la query creata nel Task 2 all'interno del RSC.
- **UI**: Implementare una tabella (es. `UserProcessesTable`, simile a `ProcessesTable`) usando `Table` di Shadcn UI per mostrare i processi accessibili (nome, domanda collegata, team di appartenenza se rilevante).
- **Ricerca/Filtro**: Aggiungere input di ricerca (`Input` Shadcn) per filtrare i processi lato client (se la lista è gestibile) o server (se necessario, modificando la query).
- **Caching**: Sfruttare il caching automatico di `fetch` in Next.js. Definire strategie di `revalidate` se i dati cambiano frequentemente.

### 4. Gestione Assegnazioni Processi (Funzionalità Avanzata - es. Team Leader)

_Nota: Questo task potrebbe richiedere permessi specifici._

- **`queries.ts`**: Implementare funzioni CRUD per la tabella `user_processes`, assicurando che un utente (es. leader) possa assegnare processi solo ai membri dei propri team e solo per i processi associati a quei team.
- **Componente (Client)**: Creare `ProcessAssignmentDialog` (`use client`) con un form (`ProcessAssignmentForm` usando `react-hook-form`, Zod, e componenti Shadcn UI - `Select`, `MultiSelect`).
- **Logica UI**:
  - Permettere la selezione di un processo gestito dal team.
  - Permettere la selezione di uno o più membri del team (recuperati tramite query).
  - Gestire stati di caricamento e errori con feedback (es. `Toast`).
- **Trigger**: Aggiungere un pulsante/icona nella `UserProcessesTable` per aprire il `ProcessAssignmentDialog` per i processi gestibili.

### 5. Ottimizzazioni e Finalizzazione

- **Minimizzare Client Components**: Usare RSC ove possibile. Isolare la logica client in componenti specifici (`ProcessAssignmentDialog`, filtri interattivi).
- **Performance Query**: Revisionare le query per assicurare l'uso di indici e select mirate.
- **UI/UX**: Garantire reattività (Tailwind), stati di caricamento (`Skeleton` Shadcn), gestione errori (`error.tsx` se necessario), e feedback utente (Toasts).
- **Testing**: Verificare la corretta visualizzazione e funzionalità per diversi ruoli/utenti.
