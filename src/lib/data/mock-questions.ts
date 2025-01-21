import { Question, QuestionFormData } from '../types/questions'

let mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Come valuti la capacità di lavorare in team?',
    type: 'SOFT',
    created_at: '2024-01-01T10:00:00Z',
    company: null
  },
  {
    id: '2',
    text: 'Quali strategie utilizzi per raggiungere gli obiettivi?',
    type: 'STRATEGY',
    created_at: '2024-01-02T10:00:00Z',
    company: null
  },
  {
    id: '3',
    text: 'Come gestisci le scadenze dei progetti?',
    type: 'EXECUTION',
    created_at: '2024-01-03T10:00:00Z',
    company: null
  }
]

export const mockQuestionsApi = {
  getAll: () => [...mockQuestions],
  
  create: (data: QuestionFormData) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: data.text,
      type: data.type,
      created_at: new Date().toISOString(),
      company: null
    }
    mockQuestions.push(newQuestion)
    return newQuestion
  },

  update: (id: string, data: QuestionFormData) => {
    const index = mockQuestions.findIndex(q => q.id === id)
    if (index === -1) throw new Error('Domanda non trovata')
    
    mockQuestions[index] = { 
      ...mockQuestions[index], 
      text: data.text,
      type: data.type
    }
    return mockQuestions[index]
  },

  delete: (id: string) => {
    const index = mockQuestions.findIndex(q => q.id === id)
    if (index === -1) throw new Error('Domanda non trovata')
    
    mockQuestions = mockQuestions.filter(q => q.id !== id)
  }
} 