import { Process } from '../types/processes'

let mockProcesses: Process[] = [
  { id: '1', processo: 'Safety specialist' },
  { id: '2', processo: 'Facility manager' },
  { id: '3', processo: 'Legal specialist' },
  { id: '4', processo: 'Compliance specialist' },
]

export const mockProcessesApi = {
  getAll: () => [...mockProcesses],
  
  create: (data: Omit<Process, 'id'>) => {
    const newProcess = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    }
    mockProcesses.push(newProcess)
    return newProcess
  },

  update: (id: string, data: Partial<Omit<Process, 'id'>>) => {
    const index = mockProcesses.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Processo non trovato')
    
    mockProcesses[index] = { ...mockProcesses[index], ...data }
    return mockProcesses[index]
  },

  delete: (id: string) => {
    const index = mockProcesses.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Processo non trovato')
    
    mockProcesses = mockProcesses.filter(p => p.id !== id)
  }
} 