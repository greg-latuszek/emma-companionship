import { z } from 'zod';

export const coupleWriteSchema = z.object({
  husband_id: z.string().uuid(),
  wife_id: z.string().uuid(),
});

export type CoupleWrite = z.output<typeof coupleWriteSchema>;
