import { z } from "zod"
import type { ClusterFormData } from "@/lib/types/clusters"

export const clusterSchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  level: z.number().nullable(),
  leader: z.string().nullable()
}) satisfies z.ZodType<ClusterFormData>

export type ClusterFormValues = z.infer<typeof clusterSchema>
