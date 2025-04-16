# Piano di Implementazione: Integrazione Tag di Valutazione

## Riferimenti Generali

- **Tipi DB**: `src/lib/supabase/database.types.ts` (Tabelle: `feedbacks`, `questions`, `question_tags`)
- **Query Supabase**: `src/lib/supabase/queries.ts`
- **Tipi Applicazione**: `src/lib/types/` (Potrebbe servire `tags.ts`)

## Riferimenti Specifici

- **Pagina di Valutazione**: `src/app/session/[id]/evaluate/page.tsx` (Componente Client)

## Task di Implementazione

### 1. Query per Recupero Tag

- **`queries.ts`**: Implementare una funzione `getTagsForQuestion(questionId: string)`.
  - Recupera tutti i `question_tags` associati a una specifica `question_id`.
  - Selezionare solo i campi necessari (`id`, `score`, `description`).
  - Ordinare per `score`.
  - Garantire type-safety usando `database.types.ts`.
  - Considerare il caching a livello di richiesta se la funzione viene chiamata ripetutamente con lo stesso ID.
  - completare il TODO attualmente presente in queries.ts sulla funzione data.map((feedback) (rigo 1773)

### 2. Gestione Tag Domande (Admin)

- **Modifica Query Recupero Domande**:✅

  - **`src/lib/supabase/queries.ts`**: Aggiornare `queries.questions.getAll` (se usata da client component `questions-view.tsx`) OPPURE creare una funzione server-side `getQuestionsWithTagCount` in `src/lib/supabase/server.ts` per includere il conteggio dei `question_tags` associati a ciascuna domanda.
    - _Nota_: Verificare `question_tags` in `src/lib/supabase/database.types.ts`.
  - **`src/lib/types/questions.ts`**: Aggiornare l'interfaccia `Question` per includere `tags_count: number`.

- **Aggiornamento Tabella Domande**:✅

  - **`src/app/@admin/questions/components/questions-table.tsx`**:
    - Aggiungere una colonna "Tags".
    - Visualizzare `question.tags_count` (es. con un `Badge` da `@/components/ui/badge`).
    - Aggiungere un `Button` variant="ghost" size="icon" per riga con un'icona (es. `Tag` da `lucide-react`) che triggeri l'apertura del dialog di gestione tag. Modificare la prop `onEdit` o aggiungere una nuova prop `onManageTags` che riceva `question.id`.

- **Creazione Componenti Gestione Tag**:

  - **Dialog (`src/app/@admin/questions/components/dialogs/✅question-tags-dialog.tsx`)**: "use client"
    - Props: `questionId: string`, `open: boolean`, `onOpenChange: (open: boolean) => void`.
    - Utilizzare `useState` per caricare e visualizzare i tag (ottenuti tramite Server Action `getQuestionTags`).
    - Visualizzare i tag in una tabella interna (`Table` da `@/components/ui/table`) con colonne per `Score`, `Description` e azioni (Modifica/Elimina).
    - Includere un pulsante "Aggiungi Tag" che apra un form inline o un sub-dialog.
    - Gestire chiamate alle Server Actions (`createQuestionTag`, `updateQuestionTag`, `deleteQuestionTag`) per le operazioni CRUD, mostrando stati di caricamento (`Loader2`) e feedback.
  - **Form (`src/app/@admin/questions/components/forms/question-tags-form.tsx`)**: "use client"
    - Utilizzare `react-hook-form` e schema Zod (`questionTagSchema`).
    - Props: `onSubmit: (data: QuestionTagFormData) => Promise<void>`, `defaultValues?`, `isLoading?`, `onCancel?`.
    - Campi: `score` (es. `Select` 1-5), `description` (`Input`).
  - **Schema Zod (`src/app/@admin/questions/components/forms/question-tags-schema.ts`)**:
    - Definire `questionTagSchema` con `score: z.number().min(1).max(5)` e `description: z.string().min(1)`.
    - Definire `QuestionTagFormData = z.infer<typeof questionTagSchema>`.
  - **Tipi (`src/lib/types/question-tags.ts`)**: (Se non già presente)
    - Definire interfaccia `QuestionTag` basata su `Database['public']['Tables']['question_tags']['Row']` da `database.types.ts`.

- **Implementazione Server Actions**:

  - **`src/lib/supabase/server.ts`**: ✅
    - `getQuestionTags(questionId: string): Promise<Tables<'question_tags'>[]>`: Recupera i tag per `questionId` dalla tabella `question_tags`.
    - `createQuestionTag(data: { question_id: string; score: number; description: string }): Promise<{ success: boolean, error?: string }>`: Inserisce un nuovo record in `question_tags`. Usa `getCurrentUser` per ottenere `company`. Chiama `revalidatePath('/admin/questions')`.
    - `updateQuestionTag(id: string, data: { score?: number; description?: string }): Promise<{ success: boolean, error?: string }>`: Aggiorna un record in `question_tags`. Chiama `revalidatePath('/admin/questions')`.
    - `deleteQuestionTag(id: string): Promise<{ success: boolean, error?: string }>`: Elimina un record da `question_tags`. Chiama `revalidatePath('/admin/questions')`.
    - _Importante_: Includere controllo permessi admin (`getCurrentUser` e verifica `admin === true`) all'inizio di ogni Server Action.

- **Integrazione nel View**: ✅
  - **`src/app/@admin/questions/components/questions-view.tsx`**: "use client"
    - Aggiungere stato `useState` per gestire l'ID della domanda selezionata per la gestione dei tag (`selectedQuestionIdForTags: string | null`).
    - Aggiungere stato `useState` per l'apertura/chiusura del `QuestionTagsDialog` (`isTagsDialogOpen: boolean`).
    - Passare la nuova prop `onManageTags` a `QuestionsTable` per impostare `selectedQuestionIdForTags` e `isTagsDialogOpen`.
    - Renderizzare `<QuestionTagsDialog>` condizionalmente, passando `questionId={selectedQuestionIdForTags}` e gestendo `open` e `onOpenChange`.

### 3. Integrazione Tag in `evaluate/page.tsx`

- **State**: Aggiungere uno stato per memorizzare i tag relativi alla domanda corrente: `useState<QuestionTag[] | null>(null)`.
- **Data Fetching**: All'interno dell'`useEffect` che carica i dati o quando `currentFeedbackIndex` cambia:
  - Recuperare il `question_id` dal `currentFeedback`.
  - Chiamare la nuova funzione `queries.getTagsForQuestion`.
  - Aggiornare lo stato dei tag.
  - Gestire stati di caricamento e errore specifici per i tag.

### 4. Componente Visualizzazione Tag (`QuestionTagsDisplay`)

- **Componente (Client)**: Creare `src/components/feedback/question-tags-display.tsx`.
  - Props: `tags: QuestionTag[] | null`, `selectedRating: number`, `onTagClick: (description: string) => void`.
  - Logica: Filtra i `tags` ricevuti in base al `selectedRating`.
  - UI: Mostra i tag filtrati (es. usando `Badge` Shadcn). Applica stili per indicarli come cliccabili.
  - Event Handler: Al click su un tag, chiama `onTagClick` passando `tag.description`.

### 5. Utilizzo di `QuestionTagsDisplay` in `evaluate/page.tsx`

- **Rendering**: Includere `<QuestionTagsDisplay />` sotto la sezione di rating.
  - Passare lo stato dei tag, lo stato `rating` attuale e una funzione `handleTagClick` come props.
- **Funzione `handleTagClick`**: Implementare la logica per:
  - Prendere la `description` del tag cliccato.
  - Aggiornare lo stato `comment` concatenando la descrizione (gestire spaziature, es. aggiungere su nuova riga o con uno spazio).
  - Aggiornare `hasCommentChanged` a `true`.
  - _Opzionale_: Scrollare fino alla textarea del commento.

### 6. Validazione Commento Obbligatorio (Lato Client)

- **Logica in `evaluate/page.tsx`**: Modificare la condizione di abilitazione/disabilitazione del pulsante "AVANTI" (o `handleNext`):
  - Se `rating > 0`, il pulsante è abilitato solo se `comment.trim() !== ''`.
  - Se `rating === 0` (Nessun feedback), il commento non è richiesto per procedere.
- **UI Feedback**: Mostrare un messaggio di errore (es. sotto la textarea) se l'utente prova ad andare avanti con `rating > 0` ma senza commento.
- _Nota_: Non è necessario modificare `queries.ts` per questa validazione.

### 7. Ottimizzazioni e Testing

- **Performance**: Valutare se il fetch dei tag per ogni cambio domanda è sufficientemente performante. Se necessario, ottimizzare pre-fetching o caching.
- **Testing**: Verificare:
  - Visualizzazione corretta dei tag per diversi rating.
  - Funzionamento del copia/incolla nel commento.
  - Logica di validazione del commento obbligatorio.
  - Reattività e usabilità su mobile.

### 8. Miglioramenti all'Esperienza Utente

- Aggiungere animazioni subtili per migliorare il feedback quando un tag viene selezionato
- Implementare suggerimenti dinamici basati sui tag più utilizzati
- Aggiungere la possibilità di filtrare o cercare tra i tag disponibili
- Migliorare l'accessibilità dell'interfaccia dei tag seguendo le best practices WCAG
