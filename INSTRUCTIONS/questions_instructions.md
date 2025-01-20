# Guida Completa alle Questions

## Struttura e Organizzazione

### Directory Structure
```
src/
├── app/
│   └── (routes)/
│       └── admin/
│           └── questions/
│               └── page.tsx       # Page component per la gestione delle domande
├── components/
│   └── questions/
│       ├── dialogs/              # Dialog components
│       │   ├── create-question-dialog.tsx
│       │   └── edit-question-dialog.tsx
│       ├── forms/               # Form components
│       │   ├── question-form.tsx
│       │   └── question-schema.ts
│       ├── questions-table.tsx  # Tabella principale
│       └── questions-view.tsx   # Container view
├── lib/
│   ├── types/
│   │   └── questions.ts        # Type definitions
│   └── supabase/
│       ├── database.types.ts   # Database type definitions
│       └── queries.ts          # Query functions
```

## Type System e Database

### Database Types (database.types.ts)
- Definisce i tipi base del database generati da Supabase
- Non modificare manualmente questi tipi
- Usare `supabase gen types typescript` per aggiornare

### Question Types (questions.ts)
```typescript
// Tipi principali
interface Question {
  id: string
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
  created_at: string
  company: string | null
}

// Tipi per operazioni CRUD
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']

// Form Data
interface QuestionFormData {
  text: string
  type: 'SOFT' | 'STRATEGY' | 'EXECUTION'
}
```

## Best Practices per Evitare Errori di Type

1. **Allineamento dei Tipi**
   ```typescript
   // ✅ Corretto
   const createQuestion = async (data: Omit<QuestionInsert, 'id'>) => {
     const { data: question, error } = await supabase
       .from('questions')
       .insert([{
         id: crypto.randomUUID(),
         ...data
       }])
       .select()
       .single()
   }

   // ❌ Errato
   const createQuestion = async (data: any) => {
     const { data: question } = await supabase
       .from('questions')
       .insert(data)
   }
   ```

2. **Gestione dei Valori Enumerati**
   ```typescript
   // ✅ Corretto
   const isValidType = (type: string): type is Question['type'] => {
     return ['SOFT', 'STRATEGY', 'EXECUTION'].includes(type)
   }

   // ❌ Errato
   const type = data.type as Question['type']
   ```

3. **Validazione dei Dati**
   ```typescript
   // ✅ Corretto
   const validateQuestion = (data: QuestionFormData) => {
     if (!data.text?.trim()) {
       throw new Error('Il testo della domanda è obbligatorio')
     }
     if (!isValidType(data.type)) {
       throw new Error('Tipo di domanda non valido')
     }
   }
   ```

## Query Functions (queries.ts)

### Struttura delle Query
```typescript
questions: {
  getAll: async () => Promise<Question[]>
  create: async (question: Omit<QuestionInsert, 'id'>) => Promise<Question>
  update: async (id: string, question: QuestionUpdate) => Promise<Question>
  delete: async (id: string) => Promise<void>
}
```

### Best Practices per le Query
1. **Generazione ID**
   ```typescript
   // ✅ Corretto
   const createQuestion = async (data: Omit<QuestionInsert, 'id'>) => {
     const { data: question, error } = await supabase
       .from('questions')
       .insert([{
         id: crypto.randomUUID(),
         ...data
       }])
       .select()
       .single()
   }

   // ❌ Errato
   const createQuestion = async (data: QuestionInsert) => {
     const { data: question } = await supabase
       .from('questions')
       .insert([data])
   }
   ```

2. **Gestione degli Errori**
   ```typescript
   // ✅ Corretto
   const { data, error } = await supabase
     .from('questions')
     .select()
   if (error) throw error
   return data

   // ❌ Errato
   const { data } = await supabase
     .from('questions')
     .select()
   return data
   ```

## Components

### Best Practices per i Componenti
1. **Props Typing**
   ```typescript
   // ✅ Corretto
   interface QuestionsTableProps {
     questions: Question[]
     onEdit?: (id: string, data: QuestionFormData) => Promise<void>
     onDelete?: (id: string) => Promise<void>
   }

   // ❌ Errato
   interface QuestionsTableProps {
     data: any[]
     onEdit?: Function
     onDelete?: Function
   }
   ```

2. **Form Validation**
   ```typescript
   // question-schema.ts
   import * as z from 'zod'

   export const questionSchema = z.object({
     text: z.string().min(1, 'Il testo è obbligatorio'),
     type: z.enum(['SOFT', 'STRATEGY', 'EXECUTION'])
   })
   ```

## Troubleshooting Comuni

### Errori di Build
1. **Property does not exist**
   ```typescript
   // Errore: Property 'type' does not exist
   // Soluzione: Usa i tipi corretti
   const type: Question['type'] = 'SOFT'
   ```

2. **Type mismatch in parameters**
   ```typescript
   // Errore: Type 'string' not assignable to type 'QuestionType'
   // Soluzione: Usa type assertion solo dopo validazione
   if (isValidType(data.type)) {
     const type = data.type as Question['type']
   }
   ```

### Checklist per la Prevenzione degli Errori
1. ✓ Verifica che i tipi corrispondano alla struttura del database
2. ✓ Usa enum validation per i tipi di domanda
3. ✓ Implementa validazioni dei form con Zod
4. ✓ Gestisci correttamente la generazione degli ID
5. ✓ Verifica le operazioni CRUD con diversi scenari di input

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
const validateQuestion = (data: QuestionFormData) => {
  if (!data.text?.trim()) {
    throw new Error('Il testo della domanda è obbligatorio')
  }
  if (!isValidType(data.type)) {
    throw new Error('Tipo di domanda non valido')
  }
}
```

## Gestione dei Dialog

### Best Practices
1. **Chiusura dei Dialog**
   ```typescript
   // ✅ Corretto
   const handleSubmit = async (data: QuestionFormData) => {
     const success = await onSubmit(data)
     if (success) {
       setOpen(false)
     }
   }

   // ❌ Errato
   const handleSubmit = async (data: QuestionFormData) => {
     await onSubmit(data)
     setOpen(!open)
   }
   ```

2. **Gestione dello Stato**
   ```typescript
   // ✅ Corretto
   const [open, setOpen] = useState<boolean>(false)

   // ❌ Errato
   const [open, setOpen] = useState(false)
   ```

## Risorse Utili
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [Zod Schema Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)