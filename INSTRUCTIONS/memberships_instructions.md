# Guida Completa alle Memberships

## Struttura e Organizzazione

### Directory Structure
```
src/
├── app/
│   └── (routes)/
│       └── admin/
│           └── memberships/
│               └── page.tsx       # Page component per la gestione delle memberships
├── components/
│   └── memberships/
│       ├── dialogs/              # Dialog components
│       │   └── create-membership-dialog.tsx
│       ├── memberships-table.tsx # Tabella principale
│       └── memberships-view.tsx  # Container view
├── lib/
│   ├── types/
│   │   └── memberships.ts       # Type definitions
│   └── supabase/
│       ├── database.types.ts    # Database type definitions
│       └── queries.ts           # Query functions
```

## Type System e Database

### Database Types (database.types.ts)
- Definisce i tipi base del database generati da Supabase
- Non modificare manualmente questi tipi
- Usare `supabase gen types typescript` per aggiornare

### Membership Types (memberships.ts)
```typescript
// Tipi principali
interface Membership {
  id: string
  user_id: string | null
  team_id: string | null
  created_at: string | null
  user?: {
    id: string
    name: string
    surname: string
  } | null
  team?: {
    id: string
    name: string
  } | null
}

// Tipi per operazioni CRUD
type MembershipInsert = Database['public']['Tables']['user_teams']['Insert']
type MembershipUpdate = Database['public']['Tables']['user_teams']['Update']
```

## Best Practices per Evitare Errori di Type

1. **Allineamento dei Tipi**
   - Usa SEMPRE i tipi `MembershipInsert` e `MembershipUpdate` per le operazioni CRUD
   - Non creare tipi custom per le operazioni di database
   - Verifica che i tipi nei componenti corrispondano ai tipi del database

2. **Accesso ai Dati Relazionali**
   ```typescript
   // ✅ Corretto
   const userName = membership.user?.name
   const teamName = membership.team?.name

   // ❌ Errato
   const userName = membership.user_name
   const teamName = membership.team_name
   ```

3. **Gestione dei Null Values**
   ```typescript
   // ✅ Corretto
   const userId = data.userId === 'none' ? null : data.userId

   // ❌ Errato
   const userId = data.userId || undefined
   ```

## Query Functions (queries.ts)

### Struttura delle Query
```typescript
user_teams: {
  getAll: async () => Promise<Membership[]>
  create: async (membership: MembershipInsert) => Promise<Membership>
  delete: async (id: string) => Promise<void>
}
```

### Best Practices per le Query
1. **Tipizzazione**
   - Usa i tipi `MembershipInsert` e `MembershipUpdate` per i parametri
   - Definisci esplicitamente i tipi di ritorno
   - Usa il tipo `Membership` per i dati restituiti

2. **Gestione degli Errori**
   ```typescript
   // ✅ Corretto
   const { data, error } = await supabase.from('user_teams')
   if (error) throw error
   return data

   // ❌ Errato
   const { data } = await supabase.from('user_teams')
   return data
   ```

## Components

### Best Practices per i Componenti
1. **Props Typing**
   ```typescript
   // ✅ Corretto
   interface MembershipsTableProps {
     memberships: Membership[]
     onDelete?: (id: string) => Promise<void>
   }

   // ❌ Errato
   interface MembershipsTableProps {
     memberships: any[]
     onDelete?: Function
   }
   ```

2. **Form Data**
   ```typescript
   // ✅ Corretto
   interface MembershipFormData {
     userId: string
     teamId: string
   }

   // ❌ Errato
   type MembershipFormData = {
     [key: string]: any
   }
   ```

## Troubleshooting Comuni

### Errori di Build
1. **Property does not exist**
   ```typescript
   // Errore: Property 'name' does not exist on type 'User | null'
   // Soluzione: Usa l'optional chaining
   const userName = user?.name
   ```

2. **Type mismatch in parameters**
   ```typescript
   // Errore: Argument type not assignable
   // Soluzione: Usa i tipi corretti del database
   const createMembership = (data: MembershipInsert) => {}
   ```

3. **Missing properties**
   ```typescript
   // Errore: Missing required properties
   // Soluzione: Includi tutte le proprietà richieste
   const membershipData: MembershipInsert = {
     id: crypto.randomUUID(),
     user_id: userId,
     team_id: teamId
   }
   ```

### Checklist per la Prevenzione degli Errori
1. ✓ Verifica che tutti i tipi siano importati correttamente
2. ✓ Usa l'optional chaining per accedere a proprietà annidate
3. ✓ Controlla la corrispondenza tra i tipi del form e del database
4. ✓ Verifica che le query utilizzino i tipi corretti
5. ✓ Testa le operazioni CRUD con diversi scenari di input

## Testing e Validazione

### Type Checking
```bash
# Esegui il type checking
npm run type-check

# Verifica la build
npm run build
```

### Validazione dei Dati
```typescript
// Implementa validazioni prima delle operazioni di database
const validateMembership = (data: MembershipFormData) => {
  if (!data.userId) throw new Error('User ID is required')
  if (!data.teamId) throw new Error('Team ID is required')
}
```

## Risorse Utili
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)