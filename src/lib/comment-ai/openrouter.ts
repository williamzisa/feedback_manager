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