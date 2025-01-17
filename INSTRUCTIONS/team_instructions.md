# Guida Completa ai Teams

## Struttura e Organizzazione

### Directory Structure
```
src/
├── app/
│   └── (routes)/
│       └── admin/
│           └── teams/
│               └── page.tsx       # Page component per la gestione dei teams
├── components/
│   └── teams/
│       ├── dialogs/              # Dialog components
│       │   ├── create-team-dialog.tsx
│       │   └── edit-team-dialog.tsx
│       ├── forms/               # Form components
│       │   ├── team-form.tsx
│       │   └── team-schema.ts
│       ├── teams-table.tsx     # Tabella principale
│       └── teams-view.tsx      # Container view
├── lib/
│   ├── types/
│   │   └── teams.ts           # Type definitions
│   └── supabase/
│       ├── database.types.ts  # Database type definitions
│       └── queries.ts         # Query functions
```

## Type System e Database

### Database Types (database.types.ts)
- Definisce i tipi base del database generati da Supabase
- Non modificare manualmente questi tipi
- Usare `supabase gen types typescript` per aggiornare

### Team Types (teams.ts)
```typescript
// Tipi principali
interface Team {
  id: string
  name: string
  company: string | null
  created_at: string | null
  isclusterleader: boolean | null
  project: boolean | null
  leader?: {
    id: string
    name: string
    surname: string
  } | null
  team_clusters?: {
    cluster?: {
      id: string
      name: string
    } | null
  }[]
  user_teams?: {
    id: string
    user_id: string | null
    team_id: string | null
    created_at: string | null
  }[]
}

// Tipi per operazioni CRUD
type TeamInsert = Database['public']['Tables']['teams']['Insert']
type TeamUpdate = Database['public']['Tables']['teams']['Update']

// Form Data
interface TeamFormData {
  name: string
  leaderId: string | 'none'
  clusterId: string | 'none'
  isclusterleader: boolean
  project: boolean
}
```

## Best Practices per Evitare Errori di Type

1. **Allineamento dei Tipi**
   ```typescript
   // ✅ Corretto
   const createTeam = async (data: TeamInsert) => {}
   const updateTeam = async (id: string, data: TeamUpdate) => {}

   // ❌ Errato
   const createTeam = async (data: any) => {}
   const updateTeam = async (id: string, data: object) => {}
   ```

2. **Accesso ai Dati Relazionali**
   ```typescript
   // ✅ Corretto
   const leaderName = team.leader?.name
   const clusterName = team.team_clusters?.[0]?.cluster?.name

   // ❌ Errato
   const leaderName = team.leader_name
   const clusterName = team.cluster_name
   ```

3. **Gestione dei Null Values**
   ```typescript
   // ✅ Corretto
   const leaderId = data.leaderId === 'none' ? null : data.leaderId
   const isClusterLeader = data.isclusterleader || null

   // ❌ Errato
   const leaderId = data.leaderId || undefined
   const isClusterLeader = Boolean(data.isclusterleader)
   ```

## Query Functions (queries.ts)

### Struttura delle Query
```typescript
teams: {
  getAll: async () => Promise<Team[]>
  create: async (team: { 
    name: string
    leader: string | null
    isclusterleader: boolean | null
    project: boolean | null
  }) => Promise<Team>
  update: async (id: string, team: {
    name?: string
    leader?: string | null
    isclusterleader?: boolean | null
    project?: boolean | null
  }) => Promise<Team>
  delete: async (id: string) => Promise<void>
}
```

### Best Practices per le Query
1. **Tipizzazione**
   ```typescript
   // ✅ Corretto
   const { data, error } = await supabase
     .from('teams')
     .select(`
       id,
       name,
       leader,
       isclusterleader,
       project,
       leader:leader(id, name, surname),
       team_clusters(
         cluster(id, name)
       )
     `)

   // ❌ Errato
   const { data } = await supabase
     .from('teams')
     .select('*')
   ```

2. **Gestione delle Relazioni**
   ```typescript
   // ✅ Corretto
   const getTeamWithMembers = async (id: string) => {
     const { data, error } = await supabase
       .from('teams')
       .select(`
         id,
         name,
         user_teams(
           user:user_id(id, name, surname)
         )
       `)
       .eq('id', id)
       .single()
     if (error) throw error
     return data
   }
   ```

## Components

### Best Practices per i Componenti
1. **Props Typing**
   ```typescript
   // ✅ Corretto
   interface TeamsTableProps {
     teams: Team[]
     onEdit?: (team: Team) => void
     onDelete?: (id: string) => Promise<void>
   }

   // ❌ Errato
   interface TeamsTableProps {
     data: any[]
     onEdit?: Function
     onDelete?: Function
   }
   ```

2. **Form Validation**
   ```typescript
   // team-schema.ts
   import * as z from 'zod'

   export const teamSchema = z.object({
     name: z.string().min(1, 'Il nome è obbligatorio'),
     leaderId: z.string(),
     clusterId: z.string(),
     isclusterleader: z.boolean(),
     project: z.boolean()
   })
   ```

## Troubleshooting Comuni

### Errori di Build
1. **Property does not exist**
   ```typescript
   // Errore: Property 'cluster_id' does not exist
   // Soluzione: Usa la struttura corretta
   const clusterId = team.team_clusters?.[0]?.cluster?.id
   ```

2. **Type mismatch in parameters**
   ```typescript
   // Errore: Type '{ name: string; }' is missing properties
   // Soluzione: Includi tutte le proprietà richieste
   const teamData: TeamInsert = {
     name: data.name,
     leader: leaderId,
     isclusterleader: data.isclusterleader || null,
     project: data.project || null
   }
   ```

### Checklist per la Prevenzione degli Errori
1. ✓ Verifica che i tipi corrispondano alla struttura del database
2. ✓ Usa optional chaining per accedere a proprietà annidate
3. ✓ Gestisci correttamente i valori null/undefined
4. ✓ Implementa validazioni dei form con Zod
5. ✓ Verifica le relazioni tra teams, users e clusters

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
const validateTeam = (data: TeamFormData) => {
  if (!data.name?.trim()) {
    throw new Error('Il nome del team è obbligatorio')
  }
  
  // Validazione aggiuntiva per cluster leader
  if (data.isclusterleader && data.clusterId === 'none') {
    throw new Error('Un team cluster leader deve essere associato a un cluster')
  }
}
```

## Gestione delle Relazioni

### Team-User (Leader)
```typescript
// Aggiornamento del leader
if (currentLeaderId !== newLeaderId) {
  // Rimuovi vecchio leader
  if (currentLeaderId) {
    await queries.user_teams.delete(oldMembership.id)
  }
  // Aggiungi nuovo leader
  if (newLeaderId) {
    await queries.user_teams.create({
      id: crypto.randomUUID(),
      team_id: team.id,
      user_id: newLeaderId
    })
  }
}
```

### Team-Cluster
```typescript
// Aggiornamento del cluster
if (currentClusterId !== newClusterId) {
  // Rimuovi vecchia associazione
  if (currentClusterId) {
    await queries.team_clusters.deleteByTeamId(team.id)
  }
  // Aggiungi nuova associazione
  if (newClusterId) {
    await queries.team_clusters.create({
      team_id: team.id,
      cluster_id: newClusterId
    })
  }
}
```

## Risorse Utili
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [Zod Schema Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
