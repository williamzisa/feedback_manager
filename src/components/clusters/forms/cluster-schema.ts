import { z } from "zod"

export const clusterSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  cluster_leader: z.string().min(1, "Il cluster leader è obbligatorio"),
  level: z.string().min(1, "Il livello è obbligatorio"),
})

export type ClusterFormValues = z.infer<typeof clusterSchema>
