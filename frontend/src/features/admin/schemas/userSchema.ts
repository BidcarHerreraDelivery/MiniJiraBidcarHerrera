import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  role: z.enum(['admin', 'usuario']),
});

export type UserFormValues = z.infer<typeof userSchema>;
