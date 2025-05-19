# Piano per l'integrazione di OpenRouter AI per il riassunto dei commenti

## Obiettivo
Creare un sistema semplice che utilizzi OpenRouter AI per riassumere i commenti ricevuti da un utente su una specifica domanda in una specifica sessione.

## Input del sistema
- `question_id`: ID della domanda
- `session_id`: ID della sessione
- `receiver`: ID dell'utente che riceve i feedback

## Flusso di esecuzione
1. Utilizzare gli input per cercare tutti i feedback nel database con questi filtri
2. Estrarre i commenti non vuoti dai feedback trovati
3. Inviare i commenti a OpenRouter AI con un prompt appropriato
4. Ricevere e mostrare il riassunto generato dal modello

## Struttura dei file
1. `src/lib/comment-ai/index.ts` - File principale che espone la funzione per richiamare il servizio
2. `src/lib/comment-ai/openrouter.ts` - Implementazione della connessione a OpenRouter
3. `src/lib/comment-ai/queries.ts` - Query per recuperare i feedback dal database
4. `src/lib/comment-ai/config.ts` - File di configurazione per API key, model ID e prompt
5. `.env.local` - Aggiungere la variabile per l'API key di OpenRouter

## Dettaglio implementativo

### 1. File di configurazione (`src/lib/comment-ai/config.ts`)
```typescript
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
export const OPENROUTER_MODEL_ID = "anthropic/claude-3-5-sonnet"; // Modello predefinito, modificabile

export const SYSTEM_PROMPT = 
`Sei un esperto nell'analisi e riassunto di feedback. Il tuo compito è leggere attentamente 
tutti i commenti forniti, comprenderne il significato più profondo, identificare i temi ricorrenti 
e il sentiment generale. Sei abile a leggere tra le righe per comprendere realmente cosa le persone 
stanno cercando di comunicare, anche quando non lo esprimono direttamente.`;

export const USER_PROMPT_TEMPLATE = 
`Riassumi in tre o quattro righe i seguenti commenti:

{comments}`;
```

### 2. Query per recuperare i feedback (`src/lib/comment-ai/queries.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export async function getFeedbackComments(
  sessionId: string, 
  questionId: string, 
  receiverId: string
) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('feedbacks')
    .select(`
      id,
      comment
    `)
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .not('comment', 'is', null)
    .not('comment', 'eq', '');
    
  if (error) {
    throw new Error(`Error fetching feedback comments: ${error.message}`);
  }
  
  return data.map(feedback => feedback.comment);
}
```

### 3. Integrazione con OpenRouter (`src/lib/comment-ai/openrouter.ts`)
```typescript
import fetch from 'node-fetch';
import { OPENROUTER_API_KEY, OPENROUTER_MODEL_ID, SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './config';

export async function generateSummary(comments: string[]): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  if (comments.length === 0) {
    return "Non ci sono commenti da riassumere.";
  }
  
  const commentsText = comments.join('\n\n');
  const userPrompt = USER_PROMPT_TEMPLATE.replace('{comments}', commentsText);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL_ID,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}
```

### 4. Funzione principale (`src/lib/comment-ai/index.ts`)
```typescript
import { getFeedbackComments } from './queries';
import { generateSummary } from './openrouter';

export async function summarizeComments(
  sessionId: string, 
  questionId: string, 
  receiverId: string
): Promise<string> {
  try {
    // 1. Recupera i commenti dal database
    const comments = await getFeedbackComments(sessionId, questionId, receiverId);
    
    // 2. Se non ci sono commenti, restituisci un messaggio informativo
    if (comments.length === 0) {
      return "Non ci sono commenti da riassumere per questa combinazione di sessione, domanda e utente.";
    }
    
    // 3. Genera il riassunto con OpenRouter
    const summary = await generateSummary(comments);
    
    return summary;
  } catch (error) {
    console.error('Error summarizing comments:', error);
    throw error;
  }
}
```

### 5. Script di test CLI (`src/scripts/test-comment-summary.ts`)
```typescript
import { summarizeComments } from '../lib/comment-ai';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.log('Usage: npm run test-summary <session_id> <question_id> <receiver_id>');
    process.exit(1);
  }
  
  const [sessionId, questionId, receiverId] = args;
  
  try {
    console.log('Generating summary...');
    const summary = await summarizeComments(sessionId, questionId, receiverId);
    console.log('\nSummary:');
    console.log(summary);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Modifiche a package.json
Aggiungere lo script di test:
```json
"scripts": {
  "test-summary": "ts-node src/scripts/test-comment-summary.ts"
}
```

## Come testare
1. Assicurarsi di avere una API key di OpenRouter
2. Aggiornare il file `.env.local` con la variabile `OPENROUTER_API_KEY=<your_api_key_here>`
3. Eseguire lo script di test fornendo i tre parametri richiesti:
   ```bash
   npm run test-summary <session_id> <question_id> <receiver_id>
   ```
4. Il terminale mostrerà il riassunto generato dal modello

## Note aggiuntive
- Il modello predefinito è `anthropic/claude-3-5-sonnet`, ma può essere modificato nel file di configurazione
- I prompt (system e user) possono essere personalizzati nel file di configurazione
- La struttura è modulare, rendendo facile estendere o modificare qualsiasi parte del sistema
- Non sono state apportate modifiche al file queries.ts esistente per ridurre al minimo l'impatto
