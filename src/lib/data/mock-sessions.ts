import { Session } from '../types/sessions'

// Mock data per clusters e regole
export const mockClusters = [
  { id: "1", name: "Compliance Legal" },
  { id: "2", name: "Foreign Memberships" },
  { id: "3", name: "Customer Satisfaction" },
  { id: "4", name: "Revenues Analyst" }
]

export const mockRules = [
  { id: "1", name: "Regola 1" },
  { id: "2", name: "Regola 2" },
  { id: "3", name: "Regola 3" },
  { id: "4", name: "Regola 4" }
]

let mockSessions: Session[] = [
  {
    id: '1',
    nomeSessione: 'Dicembre PCG',
    clusterPartecipanti: 7,
    teamPartecipanti: 23,
    utentiPartecipanti: 56,
    regoleApplicate: 13.5,
    feedbackGenerati: 2365,
    stato: 'In preparazione',
    dataInizio: '2024-02-01',
    dataFine: '2024-02-28',
    clusters: ['1', '2'],
    regole: ['1', '3'],
    generatedRules: ['1']
  },
  {
    id: '2',
    nomeSessione: 'Alessandro Cinus',
    clusterPartecipanti: 26,
    teamPartecipanti: 26,
    utentiPartecipanti: 26,
    regoleApplicate: 13.5,
    feedbackGenerati: 7460,
    stato: 'In corso',
    dataInizio: '2024-01-15',
    dataFine: '2024-02-15',
    clusters: ['2', '3'],
    regole: ['2', '4'],
    generatedRules: ['2', '4']
  },
  {
    id: '3',
    nomeSessione: 'Alessia Naranjo',
    clusterPartecipanti: 35,
    teamPartecipanti: 35,
    utentiPartecipanti: 35,
    regoleApplicate: 13.5,
    feedbackGenerati: 3216,
    stato: 'Conclusa',
    dataInizio: '2024-01-01',
    dataFine: '2024-01-31',
    clusters: ['1', '4'],
    regole: ['1', '2'],
    generatedRules: ['1', '2']
  }
]

export const mockSessionsApi = {
  getAll: () => [...mockSessions],
  
  create: (data: Omit<Session, 'id' | 'clusterPartecipanti' | 'teamPartecipanti' | 'utentiPartecipanti' | 'regoleApplicate' | 'feedbackGenerati' | 'stato'>) => {
    const newSession: Session = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      clusterPartecipanti: data.clusters?.length || 0,
      teamPartecipanti: Math.floor(Math.random() * 50) + 10,
      utentiPartecipanti: Math.floor(Math.random() * 100) + 20,
      regoleApplicate: data.regole?.length || 0,
      feedbackGenerati: Math.floor(Math.random() * 5000) + 1000,
      stato: 'In preparazione',
      generatedRules: []
    }
    mockSessions.push(newSession)
    return newSession
  },

  update: (id: string, data: Partial<Session>) => {
    const index = mockSessions.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Sessione non trovata')
    
    mockSessions[index] = { ...mockSessions[index], ...data }
    return mockSessions[index]
  },

  delete: (id: string) => {
    const index = mockSessions.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Sessione non trovata')
    
    mockSessions = mockSessions.filter(s => s.id !== id)
  },

  generateFeedback: (sessionId: string, ruleId: string) => {
    const session = mockSessions.find(s => s.id === sessionId)
    if (!session) throw new Error('Sessione non trovata')
    if (session.stato !== 'In preparazione') throw new Error('La sessione non è in preparazione')
    if (!session.regole?.includes(ruleId)) throw new Error('Regola non associata alla sessione')
    if (session.generatedRules?.includes(ruleId)) throw new Error('Feedback già generati per questa regola')

    session.generatedRules = [...(session.generatedRules || []), ruleId]
    
    if (session.generatedRules.length === session.regole.length) {
      session.stato = 'In corso'
    }

    return session
  }
} 