# Refactoring Piano per src/lib/supabase/queries.ts

## Obiettivo

Dividere il monolitico file `queries.ts` in moduli più piccoli e specifici per entità o area funzionale. Questo migliorerà la manutenibilità, la leggibilità, ridurrà l'accoppiamento e faciliterà la gestione della logica di accesso ai dati e dell'autorizzazione.

## Passi Principali

1.  **Creare Nuova Struttura di Directory:**
    *   Creare la directory `src/lib/supabase/queries/`.

2.  **Estrarre Query per Modulo:**
    *   Creare file separati all'interno di `src/lib/supabase/queries/` per ogni entità principale:
        *   `users.ts`: Funzioni relative alla tabella `users`.
        *   `companies.ts`: Funzioni relative alla tabella `companies`.
        *   `teams.ts`: Funzioni relative a `teams`, `team_clusters`, `user_teams`, `team_teams`.
        *   `clusters.ts`: Funzioni relative alla tabella `clusters`.
        *   `levels.ts`: Funzioni relative alla tabella `levels`.
        *   `processes.ts`: Funzioni relative a `processes`, `user_processes`, `team_processes`.
        *   `questions.ts`: Funzioni relative a `questions`, `question_tags`.
        *   `rules.ts`: Funzioni relative alla tabella `rules`.
        *   `sessions.ts`: Funzioni relative a `sessions`, `session_clusters`, `session_rules`, `user_sessions`, `sessionStats`.
        *   `feedbacks.ts`: Funzioni relative a `feedbacks` e le funzioni complesse `getSessionFeedback`, `getSessionComments`.
        *   `tags.ts`: Funzioni relative ai tag (se diventano più complesse o generali).

3.  **Centralizzare Inizializzazione Client e Utente:**
    *   Modificare/Creare un file (es. `src/lib/supabase/client.ts` o un nuovo `instance.ts`) per fornire un'istanza del client Supabase.
    *   Implementare un modo per ottenere l'utente corrente e la sua company una sola volta per operazione logica, passandoli come argomenti alle funzioni di query o tramite un contesto/helper centralizzato, per evitare chiamate ripetute a `getCurrentUser`.
    *   Rimuovere la funzione duplicata `getCurrentUserClient`.

4.  **Migliorare la Logica di Autorizzazione (Company Check):**
    *   Verificare la configurazione della Row Level Security (RLS) su Supabase. Se attiva e correttamente configurata, rimuovere i controlli `eq('company', currentUser.company)` ridondanti nelle query di lettura.
    *   Per le operazioni di scrittura/modifica o dove RLS non è sufficiente, centralizzare la logica di verifica della company. Creare una funzione helper `ensureUserCompany(resourceCompany)` o passare `currentUserCompany` come argomento.
    *   **Importante:** Assicurarsi che i filtri per `company` siano applicati *sempre* a livello di query Supabase (`.eq()`, `.match()`) e non filtrando i risultati in TypeScript.

5.  **Refactoring Funzioni Specifiche:**
    *   Rivedere le query complesse (es. `teams.getAll`, `sessions.getUserSessions`, `getSessionFeedback`) per ottimizzarle.
    *   Valutare lo spostamento di logica complessa di join o aggregazione in Viste o Funzioni SQL su Supabase.
    *   Standardizzare la gestione degli errori in tutti i moduli.

6.  **Creare File Indice:**
    *   Creare `src/lib/supabase/queries/index.ts`.
    *   Importare tutte le funzioni/oggetti dai moduli specifici (`users.ts`, `teams.ts`, ecc.).
    *   Esportare un oggetto `queries` aggregato (simile all'originale) o esportare direttamente i singoli moduli/funzioni per mantenere la compatibilità o adottare un nuovo stile di importazione.

7.  **Aggiornare Importazioni:**
    *   Scansionare il codebase e aggiornare tutte le importazioni che attualmente puntano a `src/lib/supabase/queries.ts` per puntare al nuovo file indice `src/lib/supabase/queries/index.ts` o ai moduli specifici, a seconda della strategia di esportazione scelta.

## Benefici Attesi

*   Codice più organizzato e modulare.
*   Migliore manutenibilità e leggibilità.
*   Riduzione dell'accoppiamento tra diverse parti dell'applicazione.
*   Gestione più semplice e centralizzata della logica di accesso ai dati e dell'autorizzazione.
*   Potenziali miglioramenti delle prestazioni grazie all'ottimizzazione delle query e alla riduzione di chiamate ridondanti.
