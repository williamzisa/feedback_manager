import { Level } from "../types/levels"

export const mockLevels: Level[] = [
  {
    id: '1',
    ruolo: 'CEO',
    step: '1',
    execution: 30,
    soft: 30,
    strategy: 40,
    standard: '4.2'
  },
  {
    id: '2',
    ruolo: 'Chief',
    step: '2',
    execution: 30,
    soft: 40,
    strategy: 30,
    standard: '4.0'
  },
  {
    id: '3',
    ruolo: 'Director',
    step: '1',
    execution: 40,
    soft: 30,
    strategy: 30,
    standard: '4.0'
  },
  {
    id: '4',
    ruolo: 'Director',
    step: '3',
    execution: 30,
    soft: 50,
    strategy: 20,
    standard: '3.8'
  }
]

// Funzioni di utilità per gestire i dati mock
export const mockLevelsApi = {
  getAll: () => [...mockLevels],
  
  create: (level: Omit<Level, 'id'>) => {
    const newLevel = {
      ...level,
      id: Math.random().toString(36).substr(2, 9)
    }
    mockLevels.push(newLevel)
    return newLevel
  },
  
  update: (id: string, level: Omit<Level, 'id'>) => {
    const index = mockLevels.findIndex(l => l.id === id)
    if (index === -1) throw new Error('Livello non trovato')
    
    const updatedLevel = { ...level, id }
    mockLevels[index] = updatedLevel
    return updatedLevel
  },
  
  delete: (id: string) => {
    const index = mockLevels.findIndex(l => l.id === id)
    if (index === -1) throw new Error('Livello non trovato')
    mockLevels.splice(index, 1)
  }
} 