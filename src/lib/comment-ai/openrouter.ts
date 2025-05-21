import { 
  OPENROUTER_API_KEY, 
  OPENROUTER_MODEL_ID, 
  SYSTEM_PROMPT, 
  SYSTEM_PROMPT_INITIATIVES,
  USER_PROMPT_TEMPLATE, 
  USER_PROMPT_INITIATIVES_TEMPLATE 
} from './config';

export async function generateSummary(comments: string[], questionDescription: string): Promise<string> {
  console.log("OPENROUTER_API_KEY disponibile:", !!OPENROUTER_API_KEY);
  console.log("OPENROUTER_API_KEY lunghezza:", OPENROUTER_API_KEY.length);
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  if (comments.length === 0) {
    return "Non ci sono commenti da riassumere.";
  }
  
  const commentsText = comments.join('\n\n');
  const userPrompt = USER_PROMPT_TEMPLATE
    .replace('{comments}', commentsText)
    .replace('{question_description}', questionDescription);
  
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
    
    // Limita il riassunto a massimo 2 frasi
    return limitSummaryToTwoSentences(data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

// Funzione per limitare il riassunto a massimo 2 frasi
function limitSummaryToTwoSentences(summary: string): string {
  const cleanedSummary = summary.trim();
  
  // Divide il testo in frasi (considerando vari tipi di terminatori di frase)
  const sentences = cleanedSummary
    .split(/[.!?]+(?:\s+|$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length <= 2) {
    return cleanedSummary;
  }
  
  // Prendi solo le prime due frasi e ricostruisci con la punteggiatura originale
  let result = "";
  let count = 0;
  
  for (let i = 0; i < cleanedSummary.length; i++) {
    result += cleanedSummary[i];
    if (/[.!?]/.test(cleanedSummary[i]) && 
        (i === cleanedSummary.length - 1 || /\s/.test(cleanedSummary[i+1]))) {
      count++;
      if (count >= 2) {
        break;
      }
    }
  }
  
  return result.trim();
}

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
    
    // Ottieni il contenuto della risposta e applicagli il post-processing
    const responseContent = data.choices[0].message.content;
    return formatInitiativesOutput(responseContent);
  } catch (error) {
    console.error('Error calling OpenRouter API for initiatives:', error);
    throw error;
  }
}

// Funzione di utility per formattare correttamente l'output delle iniziative
function formatInitiativesOutput(output: string): string {
  // Rimuovi header o introduzioni non necessarie
  const cleanedOutput = output.trim();
  
  // Cerca per iniziative formattate con elenchi puntati
  const initiatives = cleanedOutput
    .split(/[\n\r]/)
    .map(line => line.trim())
    .filter(line => line.startsWith("- ") || /^\d+\./.test(line));
  
  // Se abbiamo trovato almeno un'iniziativa formattata come punto elenco
  if (initiatives.length >= 2) {
    // Prendiamo solo le prime due iniziative e aggiungiamo un doppio newline tra di esse
    return initiatives[0] + '\n\n' + initiatives[1];
  } else {
    // Se non abbiamo trovato iniziative formattate come punti elenco, proviamo a separare il testo
    const paragraphs = cleanedOutput.split(/[\n\r]{2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    if (paragraphs.length >= 2) {
      // Formattale come elenchi puntati con doppio newline
      return `- ${paragraphs[0]}\n\n- ${paragraphs[1]}`;
    }
    
    // Ultima risorsa: dividi il testo in frasi e prendi le prime due
    const sentences = cleanedOutput
      .split(/\.(?:\s+|$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (sentences.length >= 2) {
      return `- ${sentences[0]}.\n\n- ${sentences[1]}.`;
    } else if (sentences.length === 1) {
      // Se c'è solo una frase, la usiamo come prima iniziativa e creiamo una generica per la seconda
      return `- ${sentences[0]}.\n\n- Dedicare tempo a riflettere e mettere in pratica i feedback ricevuti.`;
    } else {
      // Fallback con due iniziative generiche
      return `- Allenarmi a sperimentare nuove soluzioni in base ai feedback ricevuti.\n\n- Dedicare tempo a riflettere e mettere in pratica i suggerimenti dei colleghi.`;
    }
  }
} 