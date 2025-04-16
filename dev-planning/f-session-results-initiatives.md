# Piano di Implementazione: Session Results - Creazione e Gestione Iniziative

## Riferimenti Generali

- `src/lib/supabase/database.types.ts` (Controllare la struttura attuale della tabella `initiatives`)
- `src/lib/supabase/queries.ts` (Dove verranno aggiunte le nuove query)
- `src/lib/types/initiatives.ts` (**Da creare**: per definire i tipi specifici `Initiative`, `InitiativeInsert`, `InitiativeUpdate`)
- Documentazione Next.js 14 (App Router, Data Fetching, Caching, Server Actions)
- Documentazione Supabase (Querying, Storage se necessario)
- Documentazione Shadcn UI (Componenti UI, DataTable)
- Documentazione `nuqs` (Gestione stato URL Search Params)

## Riferimenti Specifici

- Implementazione del tasto "Crea iniziativa" nelle pagine dei risultati delle sessioni e gestione completa delle iniziative.

## Task di Implementazione

### 1. Analisi e Potenziale Aggiornamento della Struttura DB (`initiatives`)

- Esaminare la struttura attuale della tabella `initiatives` in `database.types.ts`.
- **Conferma Campi Attuali:** `id`, `created_at`, `description`, `question_id`, `session_id`, `type`, `user_id`.
- **Valutazione Aggiunte:**
  - Considerare l'aggiunta di un campo `title: string` (non nullable) per un nome breve.
  - Definire meglio il campo `type`: usare un tipo unione TypeScript (es. `'improvement' | 'process_change'`) e documentare i valori. Valutare `enum` PostgreSQL o `CHECK constraint` per coerenza futura.
- **Valutazione Campi Task 7:** Decidere se i campi `status`, `assignee_id` (FK a `users`), `due_date` sono necessari per la v1. Se sì, aggiornare la tabella DB _prima_ di procedere e rigenerare `database.types.ts`.
- **Azione:** Aggiornare questo task con le decisioni prese. Se il DB viene modificato, assicurarsi che `database.types.ts` sia aggiornato.

### 2. Definizione Tipi TypeScript (`src/lib/types/initiatives.ts`)

- Creare il file `src/lib/types/initiatives.ts`.
- Definire interfacce `Initiative`, `InitiativeInsert`, `InitiativeUpdate` basate sulla struttura (eventualmente aggiornata) della tabella `initiatives` e sui dati joinati recuperati dalle query (es. `session_name`, `user_name`).

### 3. Creazione Pagina Creazione Iniziative (`src/app/initiatives/create/page.tsx`)

- Creare il route e il file `src/app/initiatives/create/page.tsx`.
- **Component Type:** Sarà un **Client Component** (`'use client'`) poiché conterrà un form interattivo.
- **Layout:** Utilizzare il layout appropriato, mantenendo coerenza con altre pagine `@admin`.
- **Dati Iniziali:** La pagina dovrà leggere i parametri `sessionId`, `userId`, `questionId` (se presenti) dall'URL (via `useSearchParams` o `nuqs`) per pre-popolare il form.

### 4. Implementazione Form Creazione (`InitiativeForm` e Schema Zod)

- Sviluppare un componente riutilizzabile `src/app/initiatives/create/components/forms/initiative-form.tsx`.
- Creare lo schema di validazione `src/app/initiatives/create/components/forms/initiative-schema.ts` usando Zod, includendo tutti i campi necessari (compreso `title` se aggiunto) e gestendo correttamente i tipi e la nullabilità.
- Utilizzare componenti Shadcn UI (`Input`, `Textarea`, `Select`/`Combobox` per relazioni FK).
- **Upload Allegati:** Implementare solo se requisito v1, richiede integrazione con Supabase Storage.
- **Invio Dati:** Utilizzare una **Server Action** per gestire l'invio del form, che chiamerà la query `queries.initiatives.create`.

### 5. Implementazione Query Supabase (`src/lib/supabase/queries.ts`)

- Aggiungere un nuovo oggetto `initiatives` a `queries.ts`.
- **Funzioni CRUD Necessarie:**
  - `create(initiativeData: InitiativeInsert): Promise<Initiative>`
  - `getAll(params?: { filter?: string; sortBy?: string; page?: number; pageSize?: number }): Promise<Initiative[]>` (Per Server-Side filtering/sorting/pagination, se scelto) OR `getAll(): Promise<Initiative[]>` (Per Client-Side)
  - `getById(id: string): Promise<Initiative | null>`
  - `update(id: string, initiativeData: InitiativeUpdate): Promise<Initiative | null>`
  - `delete(id: string): Promise<void>`
  - Opzionale: `getBySessionId(sessionId: string): Promise<Initiative[]>`
- **Ottimizzazione:**
  - **Selezionare solo le colonne necessarie** con `select('id, title, description, session:sessions(name), ...')`.
  - Usare join espliciti di Supabase per dati correlati.
- **Gestione Cache:** Nelle Server Actions che chiamano `create`, `update`, `delete`, **invalidare la cache** usando `revalidatePath('/initiatives')` e potenzialmente `revalidateTag('initiatives')`.

### 6. Collegamento Tasto "Crea Iniziativa"

- **Posizione:** Identificare le pagine precise (es. `session_results/page.tsx`, `session_results/feedback/page.tsx`) e la posizione logica del tasto (es. a livello di sessione, per feedback specifico).
- **Componente:** Usare il componente `<Link>` di Next.js.
- **Parametri:** Passare `sessionId`, `userId`, `questionId` (se applicabile) alla pagina `/initiatives/create` tramite **URL Search Params** gestiti preferibilmente con **`nuqs`**. Esempio URL: `/initiatives/create?sessionId=...&questionId=...`
- **Controllo Accessi:** Condizionare la visibilità/abilitazione del tasto in base ai permessi dell'utente loggato.

### 7. Implementazione Pagina Visualizzazione Iniziative (`src/app/initiatives/page.tsx`)

- Creare il route e il file `src/app/initiatives/page.tsx`.
- **Component Type:** Sarà un **Server Component**. Recupererà i dati chiamando `queries.initiatives.getAll()` (o una query filtrata).
- **Tabella:** Implementare `src/app/initiatives/components/initiatives-table.tsx` usando `DataTable` di Shadcn UI. Definire le colonne (`columns.tsx`).
- **Filtro/Ordinamento/Paginazione:**
  - **Client-Side (Default):** Recuperare tutti i dati e lasciare che `DataTable` gestisca le interazioni. Semplice per iniziare.
  - **Server-Side (Scalabile):** Modificare `page.tsx` per leggere i parametri URL (da `nuqs`) e passarli a `queries.initiatives.getAll()`, che includerà `.filter()`, `.order()`, `.range()` nella chiamata Supabase. Richiede più logica ma più performante.
- **Azioni Riga:** Includere pulsanti/menu per "Modifica" (link a `/initiatives/[id]/edit` - da creare) e "Elimina" (chiama Server Action con `queries.initiatives.delete`).

### 8. Gestione Stati UI (Loading/Error)

- Creare `src/app/initiatives/loading.tsx`: Mostrare uno scheletro della tabella (`Skeleton` di Shadcn) durante il caricamento dei dati in `page.tsx`.
- Creare `src/app/initiatives/error.tsx`: Gestire errori che possono verificarsi durante il fetch dei dati in `page.tsx`. Mostrare un messaggio di errore appropriato.
- Gestire stati di caricamento e errore anche nel form di creazione/modifica (es. disabilitando il pulsante di invio durante l'operazione).

### 9. Gestione Stati e Flusso di Lavoro delle Iniziative (Opzionale v1)

- **Valutazione:** Implementare solo se strettamente necessario per la v1.
- **Richiede:**
  - Modifiche DB (Task 1).
  - Aggiornamenti a Tipi (Task 2), Form (Task 4), Query (Task 5), Tabella (Task 7).
  - Implementazione logica di business per transizioni di stato, assegnazioni, notifiche.

### 10. Testing e Ottimizzazioni Finali

- Testare il flusso E2E: creazione, visualizzazione, modifica (se implementata), eliminazione.
- Verificare la corretta invalidazione della cache (`revalidatePath`/`revalidateTag`) dopo le mutazioni.
- Assicurare la responsività e l'accessibilità dell'interfaccia.
- Monitorare le prestazioni delle query Supabase.
