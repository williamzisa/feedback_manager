/**
 * Query specifiche per il modulo Feedback Management
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../supabase/database.types';
import type { 
  ManagementFeedback, 
  FeedbackManagementStats,
  FeedbackManagementFilters
} from '../types/feedback-management.types';
import { FeedbackType } from '../types/feedback.types';

const supabase = createClientComponentClient<Database>();

export const managementQueries = {
  // Recupera i feedback per una sessione attiva
  getFeedbacks: async (sessionId: string): Promise<ManagementFeedback[]> => {
    try {
      // Prima otteniamo il conteggio totale dei feedback
      const { count, error: countError } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (countError) {
        console.error('Errore nel conteggio dei feedback:', countError);
        throw countError;
      }

      const totalCount = count || 0;
      const batchSize = 1000;
      const allFeedbacks: ManagementFeedback[] = [];

      // Recuperiamo i feedback in batch
      for (let from = 0; from < totalCount; from += batchSize) {
        const to = Math.min(from + batchSize - 1, totalCount - 1);
        
        const { data, error } = await supabase
          .from('feedbacks')
          .select(`
            id,
            value,
            comment,
            session_id,
            rule_number,
            sender:users!feedbacks_sender_fkey (id, name, surname),
            receiver:users!feedbacks_receiver_fkey (id, name, surname),
            question:questions (id, description, type)
          `)
          .eq('session_id', sessionId)
          .range(from, to);

        if (error) {
          console.error(`Errore nel recupero del batch ${from}-${to}:`, error);
          throw error;
        }

        if (data) {
          const mappedBatch = data.map(feedback => ({
            id: feedback.id,
            value: feedback.value,
            comment: feedback.comment,
            session_id: feedback.session_id,
            rule_number: feedback.rule_number,
            sender: {
              id: feedback.sender?.id || '',
              name: feedback.sender?.name || '',
              surname: feedback.sender?.surname || ''
            },
            receiver: {
              id: feedback.receiver?.id || '',
              name: feedback.receiver?.name || '',
              surname: feedback.receiver?.surname || ''
            },
            question: {
              id: feedback.question?.id || '',
              description: feedback.question?.description || '',
              type: feedback.question?.type as FeedbackType || FeedbackType.SOFT
            }
          }));

          allFeedbacks.push(...mappedBatch);
        }
      }

      console.log(`Recuperati ${allFeedbacks.length} feedback totali`);
      return allFeedbacks;
    } catch (err) {
      console.error('Errore nel recupero dei feedback:', err);
      throw err;
    }
  },

  // Recupera i feedback filtrati
  getFilteredFeedbacks: async (sessionId: string, filters: FeedbackManagementFilters): Promise<ManagementFeedback[]> => {
    // Prima prendiamo tutti i feedback
    const allFeedbacks = await managementQueries.getFeedbacks(sessionId);

    // Poi applichiamo i filtri in memoria
    return allFeedbacks.filter(feedback => {
      if (filters.sender && !`${feedback.sender.name} ${feedback.sender.surname}`.toLowerCase().includes(filters.sender.toLowerCase())) {
        return false;
      }
      if (filters.receiver && !`${feedback.receiver.name} ${feedback.receiver.surname}`.toLowerCase().includes(filters.receiver.toLowerCase())) {
        return false;
      }
      if (filters.type !== 'all' && feedback.question.type.toLowerCase() !== filters.type.toLowerCase()) {
        return false;
      }
      if (filters.responseStatus !== 'all') {
        if (filters.responseStatus === 'with_response' && feedback.value === null) {
          return false;
        }
        if (filters.responseStatus === 'without_response' && feedback.value !== null) {
          return false;
        }
      }
      return true;
    });
  },

  // Recupera le statistiche per una sessione
  getStats: async (sessionId: string): Promise<FeedbackManagementStats> => {
    // Prendiamo tutti i feedback
    const feedbacks = await managementQueries.getFeedbacks(sessionId);

    const stats: FeedbackManagementStats = {
      totalResponses: feedbacks.length,
      responseRate: 0,
      averageScore: 0,
      feedbacksByType: {
        [FeedbackType.SOFT]: 0,
        [FeedbackType.EXECUTION]: 0,
        [FeedbackType.STRATEGY]: 0
      }
    };

    // Calcola le statistiche
    const responseFeedbacks = feedbacks.filter(f => f.value !== null);
    const validScoreFeedbacks = feedbacks.filter(f => f.value !== null && f.value > 0);
    
    // Tasso di risposta (feedback con value non null / totale)
    stats.responseRate = feedbacks.length > 0 
      ? (responseFeedbacks.length / feedbacks.length) * 100 
      : 0;

    // Media dei value > 0
    const totalScore = validScoreFeedbacks.reduce((sum, f) => sum + (f.value || 0), 0);
    stats.averageScore = validScoreFeedbacks.length > 0 
      ? totalScore / validScoreFeedbacks.length 
      : 0;

    // Calcola i feedback per tipo
    feedbacks.forEach(f => {
      const feedbackType = f.question.type;
      stats.feedbacksByType[feedbackType]++;
    });

    return stats;
  }
}; 