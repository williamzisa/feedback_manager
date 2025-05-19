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