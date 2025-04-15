# Piano di Implementazione: Gestione Teams

## Riferimenti Generali

- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/queries.ts`

## Riferimenti Specifici

- `src/app/page.tsx`
- `src/components/navigation/header.tsx`
- `src/components/navigation/user-menu.tsx`
- `src/app/@admin/teams/components/teams-table.tsx`
- `src/app/@admin/teams/components/teams-view.tsx`
- `src/lib/types/teams.ts`

## Task di Implementazione

### 1. Creazione Pagina Teams Utente (`/teams`) ✅

- **Routing**: Creare un nuovo route `src/app/(routes)/teams/page.tsx` come React Server Component (RSC). ✅
- **Navigazione**: Aggiungere un link "Teams" in `src/components/navigation/user-menu.tsx`. ✅
- **Data Fetching**: ✅
  - Creare una nuova funzione `queries.teams.getUserTeams(userId: string)` in `src/lib/supabase/queries.ts` per recuperare i team associati all'utente loggato tramite la tabella `user_teams`, effettuando un join con la tabella `teams`. Utilizzare `queries.users.getCurrentUser()` per ottenere `userId`.
  - Implementare il data fetching nella pagina RSC utilizzando la nuova query, gestendo stati di caricamento (`loading.tsx` o `Suspense`) ed errori (`error.tsx`).
- **UI**: ✅
  - Creare un componente server `UserTeamsList` per visualizzare la lista dei team dell'utente.
  - Ogni elemento della lista dovrebbe permettere la navigazione verso la vista di dettaglio del team (Task 2).
- **Caching**: Sfruttare il caching automatico di Next.js per RSC. ✅

### 2. Vista Dettaglio Team e Gestione Connessioni (`/teams/[teamId]`)

- **Routing**: Creare un nuovo route dinamico `src/app/(routes)/teams/[teamId]/page.tsx` (RSC).✅
- **Data Fetching (Dettaglio)**: Recuperare i dettagli del team specifico (tramite `teamId` dai parametri URL) e la lista di tutti gli altri team per la selezione delle connessioni.✅
- **Data Fetching (Connessioni)**:
  - Creare funzioni in `queries.ts`:
    - `queries.teams.getTeamConnections(teamId: string)`: Recupera i `team_id` connessi da `team_teams`. ✅
    - `queries.teams.createTeamConnection(firstTeamId: string, secondTeamId: string)`: Inserisce una riga in `team_teams`, assicurando che `first_team_id` sia alfabeticamente minore di `second_team_id`. Gestire conflitti (duplicati). ✅
    - `queries.teams.deleteTeamConnection(firstTeamId: string, secondTeamId: string)`: Elimina una riga da `team_teams`, determinando correttamente `first_team_id` e `second_team_id` in base all'ordine alfabetico. ✅
- **UI & Logica**:
  - Creare un componente client (`'use client'`) `TeamConnectionsManager` all'interno della pagina `[teamId]`. ✅
  - Questo componente mostrerà i team già connessi e permetterà di selezionare/deselezionare altri team per creare/eliminare connessioni. ✅
  - Utilizzare `useTransition` per gestire lo stato pending delle mutazioni.✅
  - Implementare la logica per determinare `first_team_id` e `second_team_id` prima di chiamare le funzioni di `queries.ts`.✅
- **Mutations & Caching**:
  - Utilizzare Server Actions per chiamare le funzioni `createTeamConnection` e `deleteTeamConnection`.✅
  - Invalidare la cache dei dati rilevanti (es. `revalidatePath('/teams/[teamId]')` e `revalidatePath('/admin/teams')`) dopo le mutazioni.✅
- **TypeScript**: Aggiornare l'interfaccia `Team` in `src/lib/types/teams.ts` se necessario per includere informazioni sulle connessioni.✅

### 3. Aggiornamento Vista Admin (`/admin/teams`)

- **Data Fetching**:
  - Modificare `queries.teams.getAll` per includere opzionalmente un conteggio delle connessioni per ogni team (`team_teams`). Valutare l'impatto sulle performance; potrebbe essere necessaria una query separata se il join diventa troppo pesante.✅
- **UI**:
  - Aggiornare `src/app/@admin/teams/components/teams-table.tsx` per visualizzare il conteggio delle connessioni.✅
  - Aggiungere un pulsante o link nella riga della tabella per navigare a una vista/modale di gestione delle connessioni specifiche per quel team in ambito admin (potrebbe riutilizzare `TeamConnectionsManager`).✅
- **Componenti**:
  - Modificare `src/app/@admin/teams/components/dialogs/edit-team-dialog.tsx` o creare un nuovo componente/dialogo per permettere la gestione delle connessioni `team_teams` dalla vista admin.✅
- **Ottimizzazione**: Assicurare che le query aggiuntive non degradino le performance della tabella admin, considerare la paginazione se il numero di team è elevato.
- **TypeScript**: Assicurare che i tipi aggiornati per `Team` siano usati correttamente nei componenti admin.

### 4. Ottimizzazioni Generali e UI/UX

- **Feedback Utente**: Utilizzare toast (es. `sonner`) per notificare successo/errore delle operazioni di creazione/eliminazione connessioni. ✅
- **Responsiveness**: Assicurare che le nuove pagine e componenti siano responsive e utilizzabili su dispositivi mobili.
- **Type Safety**: Mantenere una stretta type safety in tutto il processo, aggiornando le interfacce `Team`, `UserTeam`, `TeamConnection` etc. in `src/lib/types/` secondo necessità.
