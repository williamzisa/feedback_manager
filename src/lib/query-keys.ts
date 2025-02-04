/**
 * Query keys centralizzate per l'applicazione
 * Utilizzate per la gestione della cache di React Query
 */

export const queryKeys = {
  // Keys per le sessioni
  sessions: {
    all: () => ['sessions'] as const,
    byCompany: (company: string) => ['sessions', 'by-company', company] as const
  },

  // Keys per i feedback in pre-session
  preSession: {
    feedbacks: {
      bySession: (sessionId: string) => ['feedbacks', 'pre-session', sessionId] as const,
      stats: (sessionId: string) => ['feedbacks', 'pre-session', 'stats', sessionId] as const,
      generation: (sessionId: string, ruleNumber: number) => 
        ['feedbacks', 'pre-session', 'generation', sessionId, ruleNumber] as const
    }
  },

  // Keys per i feedback in management
  management: {
    feedbacks: {
      bySession: (sessionId: string) => ['feedbacks', 'management', sessionId] as const,
      stats: (sessionId: string) => ['feedbacks', 'management', 'stats', sessionId] as const,
      filtered: (sessionId: string, filters: Record<string, unknown>) => 
        ['feedbacks', 'management', sessionId, 'filtered', filters] as const
    }
  },

  // Keys per l'utente
  user: {
    current: () => ['user', 'current'] as const
  }
} as const; 