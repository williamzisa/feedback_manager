import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  role: z.string().optional(),
  isMentor: z.boolean().optional(),
  isActive: z.boolean().optional(),
  mentorId: z.string().nullable().optional(),
  processes: z.array(z.string()).optional(),
  level: z.string().nullable().optional(),
});
