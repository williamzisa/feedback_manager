import { Level } from "../types/levels"

export const mockLevels: Level[] = [
  {
    id: '1',
    role: 'CEO',
    step: 1,
    execution_weight: 30,
    soft_weight: 30,
    strategy_weight: 40,
    standard: 4.2
  },
  {
    id: '2',
    role: 'Chief',
    step: 2,
    execution_weight: 30,
    soft_weight: 40,
    strategy_weight: 30,
    standard: 4.0
  },
  {
    id: '3',
    role: 'Director',
    step: 1,
    execution_weight: 40,
    soft_weight: 30,
    strategy_weight: 30,
    standard: 4.0
  },
  {
    id: '4',
    role: 'Director',
    step: 3,
    execution_weight: 30,
    soft_weight: 50,
    strategy_weight: 20,
    standard: 3.8
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