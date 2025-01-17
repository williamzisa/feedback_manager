# Guida Completa ai Clusters

## Struttura e Organizzazione

### Directory Structure
```
src/
├── app/
│   └── (routes)/
│       └── admin/
│           └── clusters/
│               └── page.tsx       # Page component per la gestione dei clusters
├── components/
│   └── clusters/
│       ├── dialogs/              # Dialog components
│       │   ├── create-cluster-dialog.tsx
│       │   └── edit-cluster-dialog.tsx
│       ├── forms/               # Form components
│       │   ├── cluster-form.tsx
│       │   └── cluster-schema.ts
│       ├── clusters-table.tsx   # Tabella principale
│       └── clusters-view.tsx    # Container view
├── lib/
│   ├── types/
│   │   └── clusters.ts         # Type definitions
│   └── supabase/
│       ├── database.types.ts   # Database type definitions
│       └── queries.ts          # Query functions
```

## Type System e Database

### Database Types (database.types.ts)
- Definisce i tipi base del database generati da Supabase
- Non modificare manualmente questi tipi
- Usare `supabase gen types typescript` per aggiornare

### Cluster Types (clusters.ts)
```typescript
// Tipi principali
interface Cluster {
  id: string
  name: string
  company: string | null
  created_at: string | null
  leader: string | null
  level: number | null
  leader_user?: {
    id: string
    name: string
    surname: string
  } | null
  team_clusters?: {
    team?: {
      id: string
      name: string
    } | null
  }[]
}

// Tipi per operazioni CRUD
type ClusterInsert = Database['public']['Tables']['clusters']['Insert']
type ClusterUpdate = Database['public']['Tables']['clusters']['Update']

// Form Data
interface ClusterFormData {
  name: string
  leaderId: string | 'none'
  level: number | null
}
```

## Best Practices per Evitare Errori di Type

1. **Allineamento dei Tipi**
   ```typescript
   // ✅ Corretto
   const createCluster = async (data: ClusterInsert) => {}
   const updateCluster = async (id: string, data: ClusterUpdate) => {}

   // ❌ Errato
   const createCluster = async (data: any) => {}
   const updateCluster = async (id: string, data: object) => {}
   ```

2. **Accesso ai Dati Relazionali**
   ```typescript
   // ✅ Corretto
   const leaderName = cluster.leader_user?.name
   const teamName = cluster.team_clusters?.[0]?.team?.name

   // ❌ Errato
   const leaderName = cluster.leader_name
   const teamName = cluster.team_name
   ```

3. **Gestione dei Null Values**
   ```typescript
   // ✅ Corretto
   const leaderId = data.leaderId === 'none' ? null : data.leaderId
   const level = data.level || null

   // ❌ Errato
   const leaderId = data.leaderId || undefined
   const level = data.level as number
   ```

## Query Functions (queries.ts)

### Struttura delle Query
```typescript
clusters: {
  getAll: async () => Promise<Cluster[]>
  create: async (cluster: { 
    name: string
    level: number | null
    leaderId: string | null 
  }) => Promise<Cluster>
  update: async (id: string, cluster: {
    name: string
    level: number | null
    leaderId: string | null
  }) => Promise<Cluster>
  delete: async (id: string) => Promise<void>
}
```

### Best Practices per le Query
1. **Tipizzazione**
   ```typescript
   // ✅ Corretto
   const { data, error } = await supabase
     .from('clusters')
     .select(`
       id,
       name,
       level,
       leader,
       leader_user:leader(id, name, surname)
     `)

   // ❌ Errato
   const { data } = await supabase
     .from('clusters')
     .select('*')
   ```

2. **Gestione delle Relazioni**
   ```typescript
   // ✅ Corretto
   const getClusterWithTeams = async (id: string) => {
     const { data, error } = await supabase
       .from('clusters')
       .select(`
         id,
         name,
         team_clusters(
           team(id, name)
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
   interface ClustersTableProps {
     clusters: Cluster[]
     onEdit?: (cluster: Cluster) => void
     onDelete?: (id: string) => Promise<void>
   }

   // ❌ Errato
   interface ClustersTableProps {
     data: any[]
     onEdit?: Function
     onDelete?: Function
   }
   ```

2. **Form Validation**
   ```typescript
   // cluster-schema.ts
   import * as z from 'zod'

   export const clusterSchema = z.object({
     name: z.string().min(1, 'Il nome è obbligatorio'),
     leaderId: z.string(),
     level: z.number().nullable()
   })
   ```

## Troubleshooting Comuni

### Errori di Build
1. **Property does not exist**
   ```typescript
   // Errore: Property 'leader_name' does not exist
   // Soluzione: Usa la struttura corretta
   const leaderName = `${cluster.leader_user?.name} ${cluster.leader_user?.surname}`
   ```

2. **Type mismatch in parameters**
   ```typescript
   // Errore: Type 'string | undefined' not assignable
   // Soluzione: Gestisci i casi undefined
   const level = typeof data.level === 'number' ? data.level : null
   ```

### Checklist per la Prevenzione degli Errori
1. ✓ Verifica la struttura dei tipi nel database
2. ✓ Usa optional chaining per proprietà annidate
3. ✓ Implementa validazione dei form con Zod
4. ✓ Gestisci correttamente i valori null/undefined
5. ✓ Usa i tipi corretti per le operazioni CRUD

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
const validateCluster = (data: ClusterFormData) => {
  if (!data.name?.trim()) {
    throw new Error('Il nome del cluster è obbligatorio')
  }
  if (data.level && (data.level < 1 || data.level > 10)) {
    throw new Error('Il livello deve essere tra 1 e 10')
  }
}
```

## Risorse Utili
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [Zod Schema Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)