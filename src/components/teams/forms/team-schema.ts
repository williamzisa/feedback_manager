import { z } from "zod"

export const teamSchema = z.object({
  name: z.string().min(1, "Il nome del team è obbligatorio"),
  clusterId: z.string().nullable(),
  leaderId: z.string().nullable(),
  isclusterleader: z.boolean().default(false),
  project: z.boolean().default(false)
})
