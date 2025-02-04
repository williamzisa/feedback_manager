/**
 * Query specifiche per il modulo Pre-Session Analysis
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../supabase/database.types';
import type { PreSessionFeedback, PreSessionAnalysisStats } from '../types/pre-session.types';
import { FeedbackType } from '../types/feedback.types';

const supabase = createClientComponentClient<Database>();

// Mapping type-safe per le funzioni di generazione feedback
const RULE_FUNCTIONS = {
  1: 'generate_rule1_feedbacks',
  2: 'generate_rule2_feedbacks',
  3: 'generate_rule3a_feedbacks',
  4: 'generate_rule4_feedbacks',
  5: 'generate_rule5_feedbacks',
  6: 'generate_rule6_feedbacks'
} as const;

export const preSessionQueries = {
  // Recupera i feedback per una sessione in preparazione
  getFeedbacks: async (sessionId: string): Promise<PreSessionFeedback[]> => {
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        id,
        value,
        comment,
        session_id,
        rule_number,
        sender:users!feedbacks_sender_fkey (name, surname),
        receiver:users!feedbacks_receiver_fkey (name, surname),
        questions (description, type)
      `)
      .eq('session_id', sessionId);

    if (error) throw error;

    return data.map(feedback => ({
      id: feedback.id,
      value: feedback.value,
      comment: feedback.comment,
      session_id: feedback.session_id,
      rule_number: feedback.rule_number,
      sender: `${feedback.sender?.name} ${feedback.sender?.surname}`,
      receiver: `${feedback.receiver?.name} ${feedback.receiver?.surname}`,
      question: feedback.questions?.description || '',
      questionType: feedback.questions?.type as FeedbackType,
      tags: []
    }));
  },

  // Recupera le statistiche per una sessione
  getStats: async (sessionId: string): Promise<PreSessionAnalysisStats> => {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks')
      .select('rule_number, questions!inner(type)')
      .eq('session_id', sessionId);

    if (error) throw error;

    const stats: PreSessionAnalysisStats = {
      totalPendingFeedbacks: feedbacks.length,
      feedbacksByRule: [],
      feedbacksByType: []
    };

    // Calcola statistiche per regola
    const ruleMap = new Map<number, number>();
    feedbacks.forEach(f => {
      if (f.rule_number) {
        ruleMap.set(f.rule_number, (ruleMap.get(f.rule_number) || 0) + 1);
      }
    });
    stats.feedbacksByRule = Array.from(ruleMap.entries()).map(([ruleNumber, count]) => ({
      ruleNumber,
      count
    }));

    // Calcola statistiche per tipo
    const typeMap = new Map<string, number>();
    feedbacks.forEach(f => {
      if (f.questions?.type) {
        typeMap.set(f.questions.type, (typeMap.get(f.questions.type) || 0) + 1);
      }
    });
    stats.feedbacksByType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type: type as FeedbackType,
      count
    }));

    return stats;
  },

  // Genera feedback per una regola specifica
  generateFeedbacksForRule: async (sessionId: string, ruleNumber: number): Promise<void> => {
    // Validazione del numero di regola
    if (!(ruleNumber in RULE_FUNCTIONS)) {
      throw new Error('Numero di regola non valido. Deve essere tra 1 e 6.');
    }

    const functionName = RULE_FUNCTIONS[ruleNumber as keyof typeof RULE_FUNCTIONS];
    const { error } = await supabase.rpc(functionName, { session_id: sessionId });
    if (error) throw error;

    // Per la regola 3, esegui anche la parte B
    if (ruleNumber === 3) {
      const { error: error3b } = await supabase
        .rpc('generate_rule3b_feedbacks', { session_id: sessionId });
      if (error3b) throw error3b;
    }
  },

  // Rimuove i feedback duplicati
  removeDuplicates: async (sessionId: string): Promise<number> => {
    const { data, error } = await supabase
      .rpc('remove_duplicate_feedbacks', { session_id: sessionId });
    
    if (error) throw error;
    return data || 0;
  }
}; 