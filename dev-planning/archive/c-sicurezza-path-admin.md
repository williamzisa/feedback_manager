# Piano di Implementazione: Sicurezza Percorso Admin con Supabase Auth

## Riferimenti Generali

- **Tipi DB**: `src/lib/supabase/database.types.ts` (Tabella `users`, campo `admin`)
- **Query Supabase**: `src/lib/supabase/queries.ts` (Funzione `getCurrentUser`)
- **Middleware Next.js**: `src/middleware.ts`
- **Auth Helpers**: `@supabase/auth-helpers-nextjs`

## Riferimenti Specifici

- **Route Admin**: `src/app/@admin/` e `src/app/(routes)/admin/`
- **Route Login**: `src/app/(auth)/login/page.tsx`

## Task di Implementazione

### 1. Verifica Campo `admin` e Query Utente

- **Database**: Assicurarsi che la tabella `users` in `database.types.ts` contenga il campo booleano `admin`.
- **`queries.ts`**: Verificare che `queries.users.getCurrentUser` recuperi correttamente il campo `admin` dell'utente autenticato.

### 2. Implementazione Middleware di Protezione (`src/middleware.ts`)

- **Creazione/Aggiornamento**: Definire o modificare `src/middleware.ts`.
- **Configurazione**: Utilizzare `createMiddlewareClient` da `@supabase/auth-helpers-nextjs` per interagire con Supabase.
- **Matcher**: Configurare il `matcher` per intercettare tutte le richieste ai percorsi `/admin/**` (incluse pagine e API routes).
- **Logica di Controllo**:
  - Recuperare la sessione utente (`supabase.auth.getSession()`).
  - **Se non autenticato**: Reindirizzare alla pagina di login (`/login`).
  - **Se autenticato**: Recuperare i dati completi dell'utente dal DB (tramite `auth_id` della sessione), includendo il flag `admin`. _Valutare se una funzione helper in `queries.ts` è necessaria o se una query diretta è appropriata nel contesto del middleware._
  - **Verifica Permessi**: Controllare se `user.admin === true`.
  - **Se non admin**: Reindirizzare a una pagina non autorizzata o alla homepage (`/`).
  - **Se admin**: Permettere l'accesso (`NextResponse.next()`).
- **Gestione Errori**: Implementare try-catch per gestire errori durante il recupero della sessione o dei dati utente.

### 3. Protezione API Routes Amministrative

- **Verifica Server-Side**: Anche se il middleware protegge l'accesso iniziale, aggiungere controlli espliciti all'interno di ogni API route handler (`route.ts`) situato sotto `/admin`.
- **Utilizzo**: Usare `createServerComponentClient` o simile per recuperare la sessione e verificare nuovamente il flag `admin` prima di eseguire operazioni sensibili.

### 4. Adeguamento Layout e Pagine Admin

- **Layout (`src/app/(routes)/admin/layout.tsx`)**: Il layout può assumere che l'utente sia un admin valido, dato che il middleware blocca gli accessi non autorizzati a monte. Non sono necessari controlli di autenticazione _duplicati_ nel layout se il middleware è robusto.
- **Componenti Admin (`src/app/@admin/`)**: I componenti possono recuperare dati e mostrare UI specifiche per admin, facendo affidamento sulla protezione garantita dal middleware.

### 5. Testing Approfondito

- **Scenari di Accesso**:
  - Utente non autenticato -> `/admin` (atteso: redirect a `/login`).
  - Utente autenticato non-admin -> `/admin` (atteso: redirect a `/` o pagina 403).
  - Utente autenticato admin -> `/admin` (atteso: accesso con successo).
- **API Routes**: Testare chiamate dirette alle API routes admin da parte di utenti non autorizzati.
- **Navigazione**: Verificare che la navigazione all'interno dell'area admin funzioni correttamente per gli utenti autorizzati.
- **Logout**: Assicurarsi che il logout invalidi l'accesso all'area admin.
