import { Membership } from '../types/memberships'
import { mockTeams } from './mock-teams'
import { mockUsers } from './mock-users'

let mockMemberships: Membership[] = [
  {
    id: '1',
    user_id: '1',
    team_id: '1',
    role: 'MEMBER',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    user_id: '2',
    team_id: '1',
    role: 'LEADER',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    user_id: '3',
    team_id: '2',
    role: 'MEMBER',
    created_at: '2024-01-01T10:00:00Z'
  }
]

export const mockMembershipsApi = {
  getAll: () => [...mockMemberships],
  
  getByTeam: (teamId: string) => {
    return mockMemberships
      .filter(m => m.team_id === teamId)
      .map(m => {
        const user = mockUsers.find(u => u.id === m.user_id)
        const team = mockTeams.find(t => t.id === m.team_id)
        return {
          ...m,
          user: user || null,
          team: team || null
        }
      })
  },

  getByUser: (userId: string) => {
    return mockMemberships
      .filter(m => m.user_id === userId)
      .map(m => {
        const user = mockUsers.find(u => u.id === m.user_id)
        const team = mockTeams.find(t => t.id === m.team_id)
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