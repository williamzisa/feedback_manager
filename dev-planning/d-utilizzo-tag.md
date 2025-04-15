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

### 2. Integrazione Dati in `evaluate/page.tsx`

- **State**: Aggiungere uno stato per memorizzare i tag relativi alla domanda corrente: `useState<QuestionTag[] | null>(null)`.
- **Data Fetching**: All'interno dell'`useEffect` che carica i dati o quando `currentFeedbackIndex` cambia:
  - Recuperare l'`question_id` dal `currentFeedback`.
  - Chiamare la nuova funzione `queries.getTagsForQuestion`.
  - Aggiornare lo stato dei tag.
  - Gestire stati di caricamento e errore specifici per i tag.

### 3. Componente Visualizzazione Tag (`QuestionTagsDisplay`)

- **Componente (Client)**: Creare `src/components/feedback/question-tags-display.tsx`.
  - Props: `tags: QuestionTag[] | null`, `selectedRating: number`, `onTagClick: (description: string) => void`.
  - Logica: Filtra i `tags` ricevuti in base al `selectedRating`.
  - UI: Mostra i tag filtrati (es. usando `Badge` Shadcn). Applica stili per indicarli come cliccabili.
  - Event Handler: Al click su un tag, chiama `onTagClick` passando `tag.description`.

### 4. Utilizzo di `QuestionTagsDisplay` in `evaluate/page.tsx`

- **Rendering**: Includere `<QuestionTagsDisplay />` sotto la sezione di rating.
  - Passare lo stato dei tag, lo stato `rating` attuale e una funzione `handleTagClick` come props.
- **Funzione `handleTagClick`**: Implementare la logica per:
  - Prendere la `description` del tag cliccato.
  - Aggiornare lo stato `comment` concatenando la descrizione (gestire spaziature, es. aggiungere su nuova riga o con uno spazio).
  - Aggiornare `hasCommentChanged` a `true`.
  - _Opzionale_: Scrollare fino alla textarea del commento.

### 5. Validazione Commento Obbligatorio (Lato Client)

- **Logica in `evaluate/page.tsx`**: Modificare la condizione di abilitazione/disabilitazione del pulsante "AVANTI" (o `handleNext`):
  - Se `rating > 0`, il pulsante è abilitato solo se `comment.trim() !== ''`.
  - Se `rating === 0` (Nessun feedback), il commento non è richiesto per procedere.
- **UI Feedback**: Mostrare un messaggio di errore (es. sotto la textarea) se l'utente prova ad andare avanti con `rating > 0` ma senza commento.
- _Nota_: Non è necessario modificare `queries.ts` per questa validazione.

### 6. Ottimizzazioni e Testing

- **Performance**: Valutare se il fetch dei tag per ogni cambio domanda è sufficientemente performante. Se necessario, ottimizzare pre-fetching o caching.
- **Testing**: Verificare:
  - Visualizzazione corretta dei tag per diversi rating.
  - Funzionamento del copia/incolla nel commento.
  - Logica di validazione del commento obbligatorio.
  - Reattività e usabilità su mobile.

### 7. Miglioramenti all'Esperienza Utente

- Aggiungere animazioni subtili per migliorare il feedback quando un tag viene selezionato
- Implementare suggerimenti dinamici basati sui tag più utilizzati
- Aggiungere la possibilità di filtrare o cercare tra i tag disponibili
- Migliorare l'accessibilità dell'interfaccia dei tag seguendo le best practices WCAG
