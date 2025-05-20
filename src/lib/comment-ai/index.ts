import { 
  getFeedbackComments, 
  getSnapshotFeedbackComments, 
  getQuestionDescription, 
  calculateOverallValue, 
  calculateMentorValue, 
  calculateSelfValue, 
  saveSnapshotSessionQuestions 
} from './queries';
import { generateSummary, generateInitiatives } from './openrouter';

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
    
    // 3. Ottieni la descrizione della domanda
    const questionDescription = await getQuestionDescription(questionId);
    
    // 4. Genera il riassunto con OpenRouter
    const summary = await generateSummary(comments, questionDescription);
    
    return summary;
  } catch (error) {
    console.error('Error summarizing comments:', error);
    throw error;
  }
}

export interface FeedbackAnalysisResult {
  overallValue: number;
  mentorValue: number;
  selfValue: number;
  summaryComments: string;
  suggestedInitiatives: string;
}

export async function generateFeedbackAnalysis(
  sessionId: string,
  questionId: string,
  userId: string
): Promise<FeedbackAnalysisResult> {
  try {
    // 1. Recupera i commenti da snapshot_feedbacks
    const comments = await getSnapshotFeedbackComments(sessionId, questionId, userId);
    
    // 2. Ottieni la descrizione della domanda
    const questionDescription = await getQuestionDescription(questionId);
    
    // 3. Calcoli i vari valori (overall, mentor, self)
    const overallValue = await calculateOverallValue(sessionId, questionId, userId);
    const mentorValue = await calculateMentorValue(sessionId, questionId, userId);
    const selfValue = await calculateSelfValue(sessionId, questionId, userId);
    
    // 4. Genera il riassunto dei commenti
    let summaryComments = "Non ci sono commenti da riassumere.";
    if (comments.length > 0) {
      summaryComments = await generateSummary(comments, questionDescription);
    }
    
    // 5. Genera le iniziative suggerite
    let suggestedInitiatives = "Non ci sono abbastanza dati per suggerire iniziative.";
    if (summaryComments !== "Non ci sono commenti da riassumere.") {
      suggestedInitiatives = await generateInitiatives(summaryComments, questionDescription);
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