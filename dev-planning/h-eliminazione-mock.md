# Piano di Implementazione: Eliminazione Dati Mock

## Riferimenti Generali

- `src/lib/supabase/database.types.ts`
- `src/lib/supabase/queries.ts`
- Next.js App Router Documentation (Data Fetching, Caching, Rendering)

## Riferimenti Specifici

- `src/lib/data/mock-people.ts` (esempio di file mock identificato)

## Task di Implementazione

### 1. Identificazione di Tutti i Dati Mock

- Eseguire una ricerca approfondita nel codebase per identificare tutti i file contenenti dati mock
- Controllare cartelle specifiche come `src/lib/data`
- Cercare file con nomi contenenti parole chiave come "mock", "fake", "sample", "test"
- Identificare anche dati mock inline all'interno di componenti o pagine (es. `useState` inizializzati con dati statici)
- Mappare ogni istanza di dati mock e la sua funzione nell'applicazione
- **Best Practice**: Considerare l'uso temporaneo di flag o variabili d'ambiente per abilitare/disabilitare i mock durante lo sviluppo, facilitando una transizione graduale

### 2. Analisi delle Dipendenze e dell'Utilizzo

- Per ogni file/istanza di dati mock, identificare dove e come viene utilizzato
- Determinare quali componenti (Server o Client) o pagine dipendono da questi dati
- Analizzare il tipo di dati forniti e la loro struttura
- Determinare se esistono già query al database in `queries.ts` che possono sostituire i dati mock o se ne servono di nuove
- Documentare i casi in cui i dati mock vengono utilizzati per testing o sviluppo (da sostituire con fixtures o factory appropriate se necessario)
- **Best Practice**: Analizzare se i dati sono richiesti in RSC o Client Components per definire la strategia di fetching appropriata

### 3. Implementazione di Query Supabase Sostitutive

- Per ogni set di dati mock, implementare o adattare le query Supabase corrispondenti in `queries.ts`
- **Best Practice (Ottimizzazione Query)**:
  - Selezionare **solo i campi strettamente necessari** (`select('field1, field2, relation(fieldA)')`) invece di `select('*')` per ridurre il carico sul DB e il payload di rete. **Revisionare le query esistenti in `queries.ts` per applicare questo principio**
  - Assicurarsi che le query sfruttino gli indici del database Supabase ove possibile. Verificare/creare indici necessari tramite `schema.sql` o UI Supabase
  - Utilizzare le relazioni (JOIN) in modo efficiente
- Assicurarsi che le query restituiscano dati con la struttura attesa dai componenti, usando i tipi da `database.types.ts`
- Implementare la gestione degli errori a livello di query (es. `try...catch`)
- **Best Practice (Caching & Data Fetching Next.js)**:
  - **Per Server Components (RSC)**:
    - Utilizzare `createServerComponentClient` o `fetch` (con l'API REST di Supabase se necessario un controllo più fine del caching) direttamente nel componente server o in funzioni dedicate chiamate da esso
    - Sfruttare il caching automatico di `fetch` di Next.js. Configurare opzioni di `fetch` (es. `{ cache: 'force-cache' | 'no-store', next: { revalidate: seconds } }`) o `revalidateTag`/`revalidatePath` per strategie di caching e revalidazione appropriate (Time-based, On-demand)
    - Avvolgere le chiamate dati in `Suspense` per lo streaming UI e migliorare LCP, utilizzando `loading.tsx` come fallback
  - **Per Client Components**:
    - **Privilegiare il passaggio dei dati come props da un RSC parente**
    - Se il fetching client-side è inevitabile (es. dati dipendenti da interazione utente non gestibile via Server Actions), usare `createClientComponentClient` all'interno di `useEffect` (con cautela) o considerare librerie come SWR/React Query per caching, revalidation, e gestione automatica degli stati (loading/error). Mantenere questi componenti il più piccoli possibile
    - Minimizzare l'uso di `'use client'`

### 4. Sostituzione dei Dati Mock nei Componenti

- Modificare i componenti per utilizzare le nuove query o ricevere i dati fetchati lato server
- **RSC**: Chiamare direttamente le funzioni di fetching asincrone. Gestire il fallback di caricamento con `loading.tsx` e gli errori con `error.tsx`
- **Client Components**: Ricevere dati via props o, se necessario, gestire il ciclo di vita del fetching (con `useEffect` o librerie), inclusi stati di caricamento (es. `useState(true)`, skeleton UI) e gestione degli errori (es. `try...catch`, mostrare messaggio all'utente). Avvolgere in `<Suspense>` se il fetching è asincrono all'interno
- Aggiornare le interfacce TypeScript per gestire i dati reali, stati di caricamento e potenziali errori
- Assicurarsi che la tipizzazione TypeScript sia mantenuta correttamente end-to-end
- Verificare che la UI/UX sia consistente e non subisca regressioni (es. mostrare stati di loading appropriati)

### 5. Eliminazione dei File Mock

- Dopo aver verificato che le sostituzione funzionino correttamente, eliminare i file di dati mock
- Rimuovere tutte le importazioni di questi file dal codebase
- Eliminare eventuali configurazioni o utility specifiche per i dati mock
- Assicurarsi che non rimangano riferimenti inutilizzati nel codice
- **Best Practice**: Verificare e aggiornare/rimuovere test unitari/e2e che dipendevano dai file mock eliminati

### 6. Testing Completo dell'Applicazione

- Testare ogni funzionalità dell'applicazione per assicurarsi che non ci siano regressioni funzionali
- Verificare che tutti i componenti che utilizzavano dati mock funzionino correttamente con i dati reali provenienti da Supabase
- Testare l'applicazione in vari scenari (dati assenti, molti dati, errori di rete/DB)
- **Best Practice**:
  - Testare specificamente gli stati di **caricamento** (`loading.tsx`, `Suspense` fallbacks, skeleton UI) e di **errore** (`error.tsx`, Error Boundaries, messaggi UI)
  - Misurare le **performance** (Web Vitals: LCP, FID, CLS) prima e dopo la modifica per identificare eventuali regressioni dovute alla latenza del fetching reale
  - Testare le strategie di **caching e revalidazione** per assicurarsi che i dati si aggiornino come previsto

### 7. Pulizia e Ottimizzazioni Finali

- Rifattorizzare il codice per rimuovere eventuali pattern o utility legacy legati ai dati mock
- Revisionare le query Supabase e le strategie di caching/fetching per eventuali ottimizzazioni finali basate sui test
- Aggiornare la documentazione (README, commenti nel codice) per riflettere i cambiamenti e le nuove strategie di data fetching
- Confermare che tutti i test (unitari, integrazione, e2e) passino con successo
