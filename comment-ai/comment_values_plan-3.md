# Piano di Implementazione: Integrazione dei Valori dei Feedback nelle Iniziative Suggerite

## Analisi del Sistema Attuale

### Componenti Principali
1. **Modulo di Configurazione** (`config.ts`)
   - Contiene chiavi API e configurazione per OpenRouter
   - Definisce i prompt di sistema per:
     - Analisi e riassunto dei commenti (`SYSTEM_PROMPT`)
     - Generazione di iniziative (`SYSTEM_PROMPT_INITIATIVES`)
   - Contiene i template per i prompt utente

2. **Modulo Principale** (`index.ts`)
   - Implementa due funzioni principali:
     - `summarizeComments`: Recupera e riassume commenti per una combinazione sessione/domanda/utente
     - `generateFeedbackAnalysis`: Orchestratore completo che:
       - Recupera commenti da snapshot_feedbacks
       - Calcola metriche (overall, mentor, self)
       - Genera riassunti dei commenti
       - Genera iniziative suggerite
       - Salva tutto in snapshot_session_questions

3. **Modulo API** (`openrouter.ts`)
   - Gestisce le chiamate all'API di OpenRouter:
     - `generateSummary`: Genera riassunti dei commenti
     - `generateInitiatives`: Genera iniziative basate sui riassunti

4. **Modulo Query** (`queries.ts`)
   - Contiene tutte le query al database:
     - Recupero commenti da feedbacks e snapshot_feedbacks
     - Ottenimento descrizioni domande
     - Calcolo valori (overall, mentor, self)
     - Salvataggio risultati in snapshot_session_questions

### Flusso del Processo Attuale
1. L'utente visualizza i risultati di una sessione di feedback
2. Il sistema attiva `generateFeedbackAnalysis`
3. I commenti vengono recuperati da snapshot_feedbacks
4. Viene generato un riassunto dei commenti
5. Vengono suggerite iniziative basate SOLO sul riassunto (senza considerare i valori numerici)
6. I risultati vengono salvati nel database

## Modifiche Necessarie

### 1. Aggiornamento del Modulo Query (`queries.ts`)
- Modificare `getSnapshotFeedbackComments` per restituire oggetti con commento e valore, non solo stringhe di commenti

```typescript
// Da:
export async function getSnapshotFeedbackComments(...): Promise<string[]>

// A:
export async function getSnapshotFeedbackComments(...): Promise<{ comment: string; value: number }[]>
```

### 2. Aggiornamento del Modulo Principale (`index.ts`)
- Modificare `generateFeedbackAnalysis` per gestire i nuovi dati di feedback
- Passare sia commenti che valori a `generateInitiatives`

### 3. Aggiornamento del Modulo API (`openrouter.ts`)
- Modificare `generateInitiatives` per accettare e utilizzare valori dei feedback
- Formattare i dati per il nuovo prompt

### 4. Aggiornamento della Configurazione (`config.ts`)
- Aggiornare `USER_PROMPT_INITIATIVES_TEMPLATE` per integrare informazioni sui valori
- Modificare `SYSTEM_PROMPT_INITIATIVES` per istruire il modello su come interpretare i valori (1=basso, 5=alto)

## Piano di Implementazione Dettagliato

### Passo 1: Aggiornare `queries.ts`
```typescript
export async function getSnapshotFeedbackComments(
  sessionId: string,
  questionId: string,
  receiverId: string
): Promise<{ comment: string; value: number }[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('snapshot_feedbacks')
    .select(`
      id,
      comment,
      value
    `)
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .not('comment', 'is', null)
    .not('comment', 'eq', '');
    
  if (error) {
    throw new Error(`Error fetching snapshot feedback comments: ${error.message}`);
  }
  
  return (data || [])
    .filter(feedback => feedback.comment !== null)
    .map(feedback => ({
      comment: feedback.comment as string,
      value: feedback.value || 0
    }));
}
```

### Passo 2: Aggiornare `index.ts`
```typescript
export async function generateFeedbackAnalysis(
  sessionId: string,
  questionId: string,
  userId: string
): Promise<FeedbackAnalysisResult> {
  try {
    // 1. Recupera i commenti con valori da snapshot_feedbacks
    const feedbackData = await getSnapshotFeedbackComments(sessionId, questionId, userId);
    
    // 2. Ottieni la descrizione della domanda
    const questionDescription = await getQuestionDescription(questionId);
    
    // 3. Calcoli i vari valori (overall, mentor, self)
    const overallValue = await calculateOverallValue(sessionId, questionId, userId);
    const mentorValue = await calculateMentorValue(sessionId, questionId, userId);
    const selfValue = await calculateSelfValue(sessionId, questionId, userId);
    
    // 4. Genera il riassunto dei commenti (usando solo il testo dei commenti)
    let summaryComments = "Non ci sono commenti da riassumere.";
    if (feedbackData.length > 0) {
      const commentsOnly = feedbackData.map(item => item.comment);
      summaryComments = await generateSummary(commentsOnly, questionDescription);
    }
    
    // 5. Genera le iniziative suggerite (usando sia commenti che valori)
    let suggestedInitiatives = "Non ci sono abbastanza dati per suggerire iniziative.";
    if (summaryComments !== "Non ci sono commenti da riassumere.") {
      suggestedInitiatives = await generateInitiatives(summaryComments, questionDescription, feedbackData);
    }
    
    // 6. Salva tutti i risultati in snapshot_session_questions
    await saveSnapshotSessionQuestions(
      sessionId,
      questionId,
      userId,
      overallValue,
      mentorValue,
      selfValue,
      summaryComments,
      suggestedInitiatives
    );
    
    // 7. Restituisci i risultati per la visualizzazione
    return {
      overallValue,
      mentorValue,
      selfValue,
      summaryComments,
      suggestedInitiatives
    };
  } catch (error) {
    console.error('Error generating feedback analysis:', error);
    throw error;
  }
}
```

### Passo 3: Aggiornare `openrouter.ts`
```typescript
export async function generateInitiatives(
  summaryComments: string, 
  questionDescription: string,
  feedbackData?: { comment: string; value: number }[]
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  if (!summaryComments || summaryComments === "Non ci sono commenti da riassumere.") {
    return "Non ci sono abbastanza dati per suggerire iniziative.";
  }
  
  // Formatta i dati di feedback con i valori se disponibili
  let feedbackDataText = "";
  if (feedbackData && feedbackData.length > 0) {
    feedbackDataText = "Con i seguenti dettagli dei feedback:\n\n";
    feedbackData.forEach((item, index) => {
      feedbackDataText += `Feedback ${index + 1} (Valutazione: ${item.value}/5): ${item.comment}\n\n`;
    });
  }
  
  const userPrompt = USER_PROMPT_INITIATIVES_TEMPLATE
    .replace('{summary_comments}', summaryComments)
    .replace('{question_description}', questionDescription)
    .replace('{feedback_data}', feedbackDataText);
  
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
            content: SYSTEM_PROMPT_INITIATIVES
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
    console.error('Error calling OpenRouter API for initiatives:', error);
    throw error;
  }
}
```

### Passo 4: Aggiornare `config.ts`
```typescript
export const SYSTEM_PROMPT_INITIATIVES = 
`Sei un coach esperto nello sviluppo professionale all'interno di contesti aziendali. Il tuo compito è supportare un responsabile e un membro del team durante un colloquio 1-to-1, suggerendo iniziative di crescita personale basate sui feedback ricevuti.
Ogni feedback ricevuto si riferisce a una o più competenze suddivise in tre aree: soft skills, execution skills e strategy skills. Per ciascuna domanda valutata.

I feedback includono sia commenti che valutazioni numeriche su una scala da 1 a 5, dove:
- 1-2: Indica aree con necessità significativa di miglioramento
- 3: Indica performance nella media
- 4-5: Indica punti di forza

Il tuo obiettivo è trasformare questi input in iniziative pratiche, concrete ed azionabili, che l'utente può mettere in pratica per migliorarsi. Queste iniziative devono avere uno stile colloquiale ma professionale e cominciare preferibilmente con frasi come:
"Prova a..."
"Cerca di..."
"Allenati a..."
"Dedica tempo a..."
Oppure con un verbo all'infinito in prima persona.

Quando suggerisci iniziative, considera:
- Per valutazioni basse (1-2): Proponi azioni correttive o di miglioramento fondamentale
- Per valutazioni medie (3): Proponi azioni di consolidamento e sviluppo
- Per valutazioni alte (4-5): Proponi azioni per eccellere ulteriormente o condividere la competenza

Mantieni un tono incoraggiante e costruttivo. Evita giudizi o valutazioni, concentrati su cosa può fare l'utente per migliorare.
Se il feedback è già positivo, suggerisci comunque come consolidare o ampliare la competenza.
Queste iniziative individuali devono essere di massimo 20 parole, concise, iniziare SEMPRE con un verbo all'infinito 
e in prima persona, descrivendo azioni che posso concludere nei prossimi sei mesi e potrebbero portarmi un beneficio concreto. 
Sii specifico e time-based.
Adatta i tuoi consigli al contesto aziendale e realistico di una persona che lavora in team.`;

export const USER_PROMPT_INITIATIVES_TEMPLATE = 
`Data la domanda: {question_description} e dati i commenti dei colleghi riassunti in questo modo:

{summary_comments}

{feedback_data}

Consigliami al massimo due iniziative che potrei completare nei prossimi 6 mesi per migliorare in base ai commenti ricevuti. `;
```

## Integrazione nell'Interfaccia Utente

Dall'analisi del codice, il processo di analisi dei feedback sembra essere attivato in due possibili punti dell'interfaccia utente:

1. **Visualizzazione dei risultati di sessione**: Quando un utente visualizza i risultati di una sessione di feedback
2. **Analisi pre-sessione**: Come suggerito dal componente `pre-session-analysis-view.tsx`

Non è necessario modificare l'UI poiché i cambiamenti proposti sono interni all'elaborazione dei dati e non cambiano le strutture di input/output visibili all'utente.

## Test e Validazione

Dopo l'implementazione, sarà necessario testare:

1. **Correttezza dei dati**: Verificare che i valori dei feedback vengano correttamente recuperati e passati
2. **Qualità delle iniziative**: Confrontare le iniziative generate prima e dopo la modifica per verificare se considerano effettivamente i valori
3. **Performance**: Verificare che l'aggiunta di dati non influisca negativamente sulle prestazioni

## Conclusione

Questo piano di implementazione permette di arricchire le iniziative suggerite con informazioni sui valori numerici dei feedback, consentendo suggerimenti più precisi e mirati. La soluzione proposta mantiene la compatibilità con il sistema esistente e richiede modifiche minime all'architettura complessiva.
