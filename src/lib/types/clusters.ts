export interface Cluster {
  id: string
  name: string
  level: number | null
  leader: string | null
  company: string | null
  created_at: string
  team_count: number
}

export type ClusterFormData = {
  name: string
  level: number | null
  leader: string | null
}
