import { Team } from '../types/teams'

// Evento custom per le modifiche ai team
const TEAMS_CHANGE_EVENT = 'teamsChange'
const emitTeamsChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TEAMS_CHANGE_EVENT))
  }
}

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Team Alpha',
    project: true,
    isclusterleader: false
  },
  {
    id: '2',
    name: 'Team Beta',
    project: false,
    isclusterleader: true
  },
  {
    id: '3',
    name: 'Team Gamma',
    project: true,
    isclusterleader: false
  }
]

// Manteniamo una copia in memoria dei team
let teamsInMemory = typeof window !== 'undefined' ? 
  JSON.parse(localStorage.getItem('mockTeams') || 'null') || mockTeams : 
  mockTeams

// API mock per gestire i team
export const mockTeamsApi = {
  getAll: () => {
    console.log('Getting teams from memory:', teamsInMemory)
    return teamsInMemory
  },

  subscribe: (callback: () => void) => {
    if (typeof window !== 'undefined') {
      window.addEventListener(TEAMS_CHANGE_EVENT, callback)
      return () => window.removeEventListener(TEAMS_CHANGE_EVENT, callback)
    }
    return () => {}
  },
  
  create: (data: Omit<Team, 'id'>) => {
    try {
      console.log('Creating team with data:', data)
      
      const newTeam: Team = {
        ...data,
        id: Math.random().toString(36).substr(2, 9)
      }
      
      teamsInMemory = [...teamsInMemory, newTeam]
      localStorage.setItem('mockTeams', JSON.stringify(teamsInMemory))
      console.log('Teams after creation:', teamsInMemory)
      emitTeamsChange()
      
      return newTeam
    } catch (error) {
      console.error('Error creating team:', error)
      throw error
    }
  },
  
  update: (id: string, data: Partial<Team>) => {
    try {
      console.log('Updating team with id:', id)
      console.log('Update data:', data)
      
      const index = teamsInMemory.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Team non trovato')
      
      // Creiamo una copia profonda del team esistente
      const existingTeam = JSON.parse(JSON.stringify(teamsInMemory[index]))
      
      // Aggiorniamo i campi mantenendo le strutture nidificate
      const updatedTeam = {
        ...existingTeam,
        name: data.name || existingTeam.name,
        project: data.project ?? existingTeam.project,
        isclusterleader: data.isclusterleader ?? existingTeam.isclusterleader
      }
      
      teamsInMemory[index] = updatedTeam
      localStorage.setItem('mockTeams', JSON.stringify(teamsInMemory))
      console.log('Teams after update:', teamsInMemory)
      emitTeamsChange()
      
      return updatedTeam
    } catch (error) {
      console.error('Error updating team:', error)
      throw error
    }
  },
  
  delete: (id: string) => {
    try {
      console.log('Deleting team with id:', id)
      const index = teamsInMemory.findIndex(t => t.id === id)
      
      if (index === -1) throw new Error('Team non trovato')
      
      teamsInMemory = teamsInMemory.filter(t => t.id !== id)
      localStorage.setItem('mockTeams', JSON.stringify(teamsInMemory))
      console.log('Teams after deletion:', teamsInMemory)
      emitTeamsChange()
    } catch (error) {
      console.error('Error deleting team:', error)
      throw error
    }
  }
} 