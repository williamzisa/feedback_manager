export interface Cluster {
  id: string
  name: string
  level: number | null
  company: string | null
  created_at: string | null
  leader?: {
    id: string
    name: string
    surname: string
  } | null
  team_clusters?: {
    id: string
    team?: {
      id: string
      name: string
      leader?: {
        id: string
        name: string
        surname: string
      } | null
    } | null
  }[]
  team_count: number
}

export type ClusterFormData = {
  name: string
  level: number | null
  leaderId: string | null
}
