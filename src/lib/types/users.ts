export type Level = 'Junior' | 'Mid' | 'Senior'

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