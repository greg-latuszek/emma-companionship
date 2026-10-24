import type { CoupleListItem, CoupleParticipant } from '@/types/couple';
import type { MessageKey } from '@/i18n/translator';

export const coupleListExtraFields = ['email', 'phone', 'notes'] as const;
export type CoupleListExtraField = (typeof coupleListExtraFields)[number];

export const defaultCoupleListExtraFields: CoupleListExtraField[] = [];

export const coupleListFieldLabelKeys: Record<CoupleListExtraField, MessageKey> = {
  email: 'member.field.email',
  phone: 'member.field.phone',
  notes: 'member.field.notes',
};

export const coupleListExtraFieldsStorageKey =
  'emma.couple-tabs.extra-fields';

export function coupleDisplayName(couple: CoupleListItem): string {
  return `${couple.husband.first_name} ${couple.husband.last_name} / ${couple.wife.first_name} ${couple.wife.last_name}`;
}

export function coupleParticipantFieldText(
  person: CoupleParticipant,
  field: CoupleListExtraField
): string {
  const value = person[field];
  return value ?? '';
}

export function readStoredCoupleListExtraFields(
  storage: Pick<Storage, 'getItem'>
): CoupleListExtraField[] {
  const raw = storage.getItem(coupleListExtraFieldsStorageKey);
  if (!raw) {
    return defaultCoupleListExtraFields;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return defaultCoupleListExtraFields;
    }
    return parsed.filter((field): field is CoupleListExtraField =>
      (coupleListExtraFields as readonly string[]).includes(field)
    );
  } catch {
    return defaultCoupleListExtraFields;
  }
}

export function storeCoupleListExtraFields(
  fields: CoupleListExtraField[],
  storage: Pick<Storage, 'setItem'>
): void {
  storage.setItem(coupleListExtraFieldsStorageKey, JSON.stringify(fields));
}

export function toggleCoupleListExtraField(
  fields: CoupleListExtraField[],
  field: CoupleListExtraField
): CoupleListExtraField[] {
  if (fields.includes(field)) {
    return fields.filter((current) => current !== field);
  }
  return [...fields, field];
}
