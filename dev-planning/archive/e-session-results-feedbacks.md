# Piano di Implementazione: Session Results - Dettaglio Feedback per Skill

## Riferimenti Generali

- **Tipi DB**: `src/lib/supabase/database.types.ts` (Tabelle: `feedbacks`, `user_sessions`, `questions`, `users`, `sessions`)
- **Query Supabase**: `src/lib/supabase/queries.ts` (Funzione `getSessionFeedback`)
- **Tipi Applicazione**: `src/lib/types/`

## Riferimenti Specifici

- **Pagina Dettaglio Feedback**: `src/app/session_results/feedback/page.tsx`
- **Pagina Risultati Sessione**: `src/app/session_results/page.tsx`
- **Componenti UI**: `src/components/ui/`

## Task di Implementazione

### 1. Adeguamento Query e Data Fetching ✅

- **`queries.ts` (`getSessionFeedback`)**: Modificare la funzione per:
  - Restituire anche i dettagli della `sessions` associata (`name`, `end_time`) tramite join o query separata efficiente.
  - Assicurarsi che vengano recuperati tutti i campi necessari da `feedbacks`, `questions` (specialmente `type`), e `users` (sender).
- **`feedback/page.tsx`**:
  - Recuperare dinamicamente i dettagli della sessione (nome, data fine) invece di usare valori hardcodati.
  - Utilizzare la `sessionId` dallo stato o URL per popolare il selettore della sessione.
  - Filtrare i `feedbacks` ricevuti dalla query in base al `selectedSkill` (confrontando con `feedback.question.type`). Conservare questi feedback filtrati in uno stato (es. `filteredSkillFeedbacks`).
  - Introdurre uno stato per l'indice del feedback attualmente visualizzato all'interno della lista filtrata (es. `currentFeedbackIndex`).

### 2. Visualizzazione Feedback Individuali per Skill✅

- **`feedback/page.tsx`**: Modificare la sezione "Question and Rating" per:
  - Mostrare la descrizione della domanda del feedback corrente: `filteredSkillFeedbacks[currentFeedbackIndex].question.description`.
  - Mostrare il nome del mittente: `filteredSkillFeedbacks[currentFeedbackIndex].sender.name`.
  - Visualizzare il rating (stelle) basato sul valore: `filteredSkillFeedbacks[currentFeedbackIndex].value`.
  - _Rimuovere_ la logica che mostrava solo `feedbacks[0]`.
- **Navigazione Feedback**: Implementare la logica per i pulsanti "Prossima Domanda" e "Domanda Precedente" (se necessario) per aggiornare `currentFeedbackIndex` e scorrere attraverso `filteredSkillFeedbacks`.

### 3. Miglioramento UI Valori Aggregati (Overall, Mentor, Self)

- **`feedback/page.tsx`**: Mantenere l'uso dei dati da `userSession` per questi valori aggregati, poiché rappresentano le medie calcolate.
- **Componente UI**: Creare un componente riutilizzabile `FeedbackScoreCard` (es. in `src/components/results/`) per visualizzare questi punteggi in modo più chiaro e potenzialmente grafico (barre semplici o indicatori colorati potrebbero essere sufficienti).
- **Integrazione**: Sostituire l'attuale blocco di testo con l'uso del nuovo componente `FeedbackScoreCard`.

### 4. Gestione Commenti

- **`feedback/page.tsx`**:
  - Mantenere il link esistente alla pagina `/session_results/comment`.
  - Assicurarsi che il link passi correttamente `sessionId`, `userId`, `userName` e `selectedSkill` come parametri URL.
  - Aggiornare dinamicamente il conteggio dei commenti visualizzato nel link basandosi sui `filteredSkillFeedbacks` che hanno un `comment` non nullo.

### 5. Gestione Azioni (Iniziativa)

- **`feedback/page.tsx`**:
  - Collegare il pulsante "Crea iniziativa" a una futura funzionalità (potrebbe aprire un dialog).
  - La logica specifica della creazione di iniziative è fuori dallo scope di _questo_ piano ma il collegamento UI va predisposto.

### 6. Ottimizzazioni e Testing

- **Performance**: Assicurare che `getSessionFeedback` sia efficiente e non recuperi dati non necessari. Il filtering lato client è probabilmente accettabile dato il numero di feedback per utente/sessione.
- **Type Safety**: Verificare l'uso corretto dei tipi `UserSession`, `Feedback`, `Question` ecc. in tutto il componente.
- **Testing**:
  - Testare con sessioni e skill diverse.
  - Verificare la corretta visualizzazione e navigazione dei feedback individuali.
  - Controllare il passaggio dei parametri alle pagine `comment`.
  - Testare stati di caricamento ed errore.
  - Verificare reattività UI.
