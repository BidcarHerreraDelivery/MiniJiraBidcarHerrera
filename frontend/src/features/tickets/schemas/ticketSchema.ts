import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(120, 'Máximo 120 caracteres'),
  priority: z.enum(['baja', 'media', 'alta'], { required_error: 'La prioridad es obligatoria' }),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  labels: z.array(z.string().uuid()).optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
