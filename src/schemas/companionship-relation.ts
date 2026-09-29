import { z } from 'zod';
import {
  companionshipRelationStatuses,
  type CompanionshipRelationStatus,
} from '@/types/companionship-relation';

function nullWhenBlank(value: unknown): unknown {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

const isoDate = z.preprocess(
  nullWhenBlank,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected ISO date (YYYY-MM-DD)')
    .nullable()
);

export const companionshipRelationWriteSchema = z.object({
  companion_id: z.string().uuid(),
  accompanied_id: z.string().uuid(),
  status: z.enum(companionshipRelationStatuses).optional(),
  start_date: isoDate,
  end_date: isoDate,
  notes: z.preprocess(nullWhenBlank, z.string().nullable()),
});

export type CompanionshipRelationWrite = Omit<
  z.output<typeof companionshipRelationWriteSchema>,
  'status'
> & {
  status?: CompanionshipRelationStatus;
};

export type CompanionshipRelationWriteWithDefaults = Omit<
  CompanionshipRelationWrite,
  'status' | 'start_date'
> & {
  status: CompanionshipRelationStatus;
  start_date: string | null;
};

export function companionshipRelationWriteWithDefaults(
  write: CompanionshipRelationWrite
): CompanionshipRelationWriteWithDefaults {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...write,
    status: write.status ?? 'active',
    start_date: write.start_date ?? today,
  };
}
