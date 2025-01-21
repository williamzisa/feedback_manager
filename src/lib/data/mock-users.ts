import { User } from '../types/users'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    role: 'developer',
    isMentor: true,
    isActive: true,
    processes: ['Process A', 'Process B'],
    level: 'Junior',
    mentorId: '4'  // Laura Neri
  },
  {
    id: '2',
    name: 'Luigi',
    surname: 'Verdi',
    email: 'luigi.verdi@example.com',
    role: 'designer',
    isMentor: false,
    isActive: true,
    processes: ['Process C'],
    level: 'Senior',
    mentorId: '6'  // Marco Bianchi
  },
  {
    id: '3',
    name: 'Anna',
    surname: 'Bianchi',
    email: 'anna.bianchi@example.com',
    role: 'manager',
    isMentor: true,
    isActive: false,
    processes: [],
    level: 'Mid',
    mentorId: '2'  // Giuseppe Verdi
  },
  {
    id: '4',
    name: 'Laura',
    surname: 'Neri',
    email: 'laura.neri@example.com',
    role: 'senior developer',
    isMentor: true,
    isActive: true,
    processes: ['Process A', 'Process D'],
    level: 'Senior',
    mentorId: '6'  // Marco Bianchi
  },
  {
    id: '5',
    name: 'Paolo',
    surname: 'Ferrari',
    email: 'paolo.ferrari@example.com',
    role: 'tech lead',
    isMentor: true,
    isActive: true,
    processes: ['Process B', 'Process C'],
    level: 'Senior',
    mentorId: '2'  // Giuseppe Verdi
  },
  {
    id: '6',
    name: 'Marco',
    surname: 'Bianchi',
    email: 'marco.bianchi@example.com',
    role: 'architect',
    isMentor: true,
    isActive: true,
    processes: ['Process A', 'Process B', 'Process C', 'Process D'],
    level: 'Senior',
    mentorId: '5'  // Paolo Ferrari
  }
]

// API mock per gestire gli utenti
export const mockUsersApi = {
  getAll: () => [...mockUsers],
  
  create: (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9)
    }
    mockUsers.push(newUser)
    return newUser
  },
  
  update: (id: string, userData: Partial<User>) => {
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Utente non trovato')
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...userData
    }
    return mockUsers[index]
  },
  
  delete: (id: string) => {
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Utente non trovato')
    mockUsers.splice(index, 1)
  }
} 