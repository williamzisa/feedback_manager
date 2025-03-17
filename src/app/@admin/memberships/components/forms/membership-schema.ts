import { z } from "zod"

export const membershipSchema = z.object({
  userId: z.string({
    required_error: "Seleziona un utente"
  }),
  teamId: z.string({
    required_error: "Seleziona un team"
  })
})
