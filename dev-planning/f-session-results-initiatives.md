# Piano di Implementazione: Session Results - Creazione e Gestione Iniziative

## Riferimenti Generali

- `src/lib/supabase/database.types.ts` (Controllare la struttura attuale della tabella `initiatives`)
- `src/lib/supabase/queries.ts` (Dove verranno aggiunte le nuove query)
- `src/lib/types/initiatives.ts` (**Da creare**: per definire i tipi specifici `Initiative`, `InitiativeInsert`, `InitiativeUpdate`)
- Documentazione Next.js 14 (App Router, Data Fetching, Caching, Server Actions)
- Documentazione Supabase (Querying, Storage se necessario)
- Documentazione Shadcn UI (Componenti UI, DataTable)
- Documentazione `nuqs` (Gestione stato URL Search Params)
- src\app\session_results\feedback\page.tsx

## Riferimenti Specifici

- Implementazione del tasto "Crea iniziativa" nelle pagine dei risultati delle sessioni e modifica delle iniziative create sempre nella pagina src\app\session_results\feedback\page.tsx

## Task Completate ✓

### 1. Definizione Tipi TypeScript (`src/lib/types/initiatives.ts`)

- Creato file con definizioni dei tipi
- Definito tipo `InitiativeType = "SOFT" | "STRATEGY" | "EXECUTION"`
- Definite interfacce `Initiative`, `InitiativeInsert`, `InitiativeUpdate`
- Aggiunti campi relazionali per `question` e `user`

## Task da Completare

### 2. Implementazione UI in `src/app/session_results/feedback/page.tsx`

### 3. Implementazione Dialog di creazione/modifica dell'iniziativa.

- Sviluppare un componente Dialog in src\app\session_results\feedback\page.tsx
- Utilizzare componenti Shadcn UI (`Input`, `Textarea`, `Select`/`Combobox` per relazioni FK).
- **Invio Dati:** Utilizzare una **Server Action** per gestire l'invio del Dialog, che chiamerà la query `queries.initiatives.create`.

- Creare componente `CreateInitiativeDialog`
- Utilizzare Shadcn Dialog, Form e Input components
- Implementare form con validazione usando zod
- Gestire stati loading/error

#### Integrazione UI Esistente

- Collegare dialog al pulsante "Crea iniziativa" esistente, che diventa più piccolo per far spazio alla lista iniziative
- Aggiungere lista iniziative sotto il feedback corrente
- Implementare funzionalità di modifica/eliminazione delle iniziative appena create

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

### 4. Server Actions

- Implementare server action per creazione iniziativa
- Implementare server action per modifica iniziativa
- Implementare server action per eliminazione iniziativa
- Gestire invalidazione cache con `revalidatePath`

### 5. Testing e Validazione

- Verificare funzionamento CRUD operazioni
- Testare validazione form
- Verificare gestione errori
- Controllare UX loading states
