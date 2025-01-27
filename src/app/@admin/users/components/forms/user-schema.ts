import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri"),
  email: z.string().email("Inserisci un indirizzo email valido"),
  level: z.string().nullable(),
  mentor: z.string().nullable(),
  company: z.string().nullable(),
  admin: z.boolean(),
  status: z.string(),
  auth_id: z.string().nullable()
});
