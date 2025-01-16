export type Cluster = {
  id: string
  name: string
  level: number | null
  leader: {
    id: string
    name: string
    surname: string
  } | null
  team_clusters?: { id: string }[]
  team_count: number
}

export type ClusterFormData = {
  name: string
  level: number | null
  leaderId: string | null
}
