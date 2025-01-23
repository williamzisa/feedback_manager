export type Level = 'Junior 1' | 'Junior 2' | 'Junior 3' | 'Mid 1' | 'Mid 2' | 'Mid 3' | 'Senior 1' | 'Senior 2' | 'Senior 3' | 'Manager (F) 1' | 'PCG Manager 1' | null

export interface User {
  id: string
  name: string
  surname: string
  email: string
  role: string
  isMentor: boolean
  isActive: boolean
  processes: string[]
  level: Level
  mentorId: string | null
}

export type UserFormData = Omit<User, 'id'> 