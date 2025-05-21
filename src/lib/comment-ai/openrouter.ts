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
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
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
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API for initiatives:', error);
    throw error;
  }
} 