# Piano di implementazione - Sistema di analisi commenti e suggerimento iniziative

## Panoramica
Implementare un sistema che analizzi i commenti dei feedback, generi un riassunto e suggerisca iniziative. I risultati verranno salvati nella tabella `snapshot_session_questions` e visualizzati nell'interfaccia utente.

## 1. Modifiche ai file di configurazione

### `config.ts`
- Aggiungere un nuovo system prompt per la generazione di iniziative 
- Modificare l'attuale user prompt per includere la descrizione della domanda
- Aggiungere un template per il prompt delle iniziative
  - es. Data la domanda {question.description} e dati i commenti dei suoi colleghi riassunti in questo modo {summary_comments}, consigliami al massimo due task che potrei completare nei prossimi 6 mesi per migliorare in base ai commenti ricevuti. Queste iniziative individuali devono essere di massimo 20 parole, concise, iniziare SEMPRE con un verbo all'infinito e in prima persona, descrivendo azioni che posso concludere nei prossimi sei mesi e potrebbero portarmi un beneficio concreto. Sii specifico e time-based.

## 2. Modifiche alle query

### `queries.ts`
- Creare una nuova funzione `getSnapshotFeedbackComments` che legga dalla tabella `snapshot_feedbacks`
- Implementare la funzione `getQuestionDescription` per ottenere la descrizione della domanda
- Implementare le funzioni per calcolare:
  - `calculateOverallValue`: media dei feedback value (esclusi self-feedback e feedbacks con value = 0)
  - `calculateMentorValue`: value del feedback dal mentor (id del mentor in public.users.mentor)
  - `calculateSelfValue`: value dell'autovalutazione
- Creare una funzione `saveSnapshotSessionQuestions` per salvare i risultati

## 3. Modifiche alla logica di elaborazione

### `openrouter.ts`
- Modificare `generateSummary` per accettare sia commenti che descrizione domanda
- Implementare `generateInitiatives` per generare suggerimenti basati sul riassunto
- Aggiungere il supporto per gestire entrambe le richieste in sequenza

### `index.ts`
- Implementare una nuova funzione `generateFeedbackAnalysis` che:
  1. Recuperi i commenti da `snapshot_feedbacks`
  2. Ottenga la descrizione della domanda
  3. Calcoli i vari valori (overall, mentor, self)
  4. Generi il riassunto dei commenti
  5. Generi le iniziative suggerite
  6. Salvi tutti i risultati in `snapshot_session_questions`
  7. Restituisca i risultati per la visualizzazione

## 4. Integrazione UI

### `CommentsDialog`
- Modificare per visualizzare il riassunto dei commenti recuperato da `snapshot_session_questions`
- Aggiungere un pulsante per generare l'analisi se non esiste ancora

### `InitiativeDialog`
- Modificare per visualizzare le iniziative suggerite recuperate da `snapshot_session_questions`
- Consentire all'utente di selezionare un'iniziativa suggerita o creare la propria

### `page.tsx` (feedback/page.tsx)
- Aggiungere logica per verificare l'esistenza di un'analisi per la combinazione session/question/user
- Implementare la chiamata a `generateFeedbackAnalysis` quando necessario
- Aggiornare la visualizzazione per mostrare riassunto e iniziative suggerite

## 5. Aggiornamento script di test

### `test-comment-summary.ts`
- Aggiornare per testare sia il riassunto che la generazione di iniziative
- Aggiungere supporto per testare il salvataggio in `snapshot_session_questions`

## Ordine di implementazione
1. Aggiornare config.ts con i nuovi prompt
2. Implementare le nuove query in queries.ts
3. Modificare openrouter.ts per supportare entrambe le richieste
4. Aggiornare index.ts con la nuova funzione principale
5. Integrare con l'UI
6. Testare e aggiustare il sistema

## Note importanti
- Mantenere l'isolamento funzionale nella cartella `comment-ai`
- Garantire che il sistema funzioni sia da UI che da script di test
- Verificare che i risultati vengano correttamente visualizzati nell'interfaccia
- Assicurarsi che le richieste API vengano effettuate solo quando necessario (evitare duplicazioni) 