import { Membership } from '../types/memberships'
import { mockTeams } from './mock-teams'
import { mockUsers } from './mock-users'

let mockMemberships: Membership[] = [
  {
    id: '1',
    userId: '1',
    teamId: '1',
    role: 'MEMBER',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    teamId: '1',
    role: 'LEADER',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    userId: '3',
    teamId: '2',
    role: 'MEMBER',
    created_at: '2024-01-01T10:00:00Z'
  }
]

export const mockMembershipsApi = {
  getAll: () => [...mockMemberships],
  
  getByTeam: (teamId: string) => {
    return mockMemberships
      .filter(m => m.teamId === teamId)
      .map(m => {
        const user = mockUsers.find(u => u.id === m.userId)
        const team = mockTeams.find(t => t.id === m.teamId)
        return {
          ...m,
          user: user || null,
          team: team || null
        }
      })
  },

  getByUser: (userId: string) => {
    return mockMemberships
      .filter(m => m.userId === userId)
      .map(m => {
        const user = mockUsers.find(u => u.id === m.userId)
        const team = mockTeams.find(t => t.id === m.teamId)
        return {
          ...m,
          user: user || null,
          team: team || null
        }
      })
  },

  create: (data: Omit<Membership, 'id' | 'created_at'>) => {
    const newMembership: Membership = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    }
    mockMemberships.push(newMembership)
    return newMembership
  },

  update: (id: string, data: Partial<Membership>) => {
    const index = mockMemberships.findIndex(m => m.id === id)
    if (index === -1) throw new Error('Membership non trovata')
    
    mockMemberships[index] = { ...mockMemberships[index], ...data }
    return mockMemberships[index]
  },

  delete: (id: string) => {
    const index = mockMemberships.findIndex(m => m.id === id)
    if (index === -1) throw new Error('Membership non trovata')
    
    mockMemberships = mockMemberships.filter(m => m.id !== id)
  }
} 