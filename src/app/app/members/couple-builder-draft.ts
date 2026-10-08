import type { CoupleBuilderRow } from '@/application/couple-builder-rows';

export const coupleBuilderDraftStorageKey = 'emma.couple-builder.draft';

export type CoupleBuilderDraft = {
  rejectedPairKeys: string[];
  rows: CoupleBuilderRow[];
};

export function readStoredCoupleBuilderDraft(
  storage: Pick<Storage, 'getItem'>
): CoupleBuilderDraft | null {
  const raw = storage.getItem(coupleBuilderDraftStorageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CoupleBuilderDraft>;
    if (!Array.isArray(parsed.rejectedPairKeys) || !Array.isArray(parsed.rows)) {
      return null;
    }
    return {
      rejectedPairKeys: parsed.rejectedPairKeys.filter(
        (key): key is string => typeof key === 'string'
      ),
      rows: parsed.rows
        .filter(
          (row): row is CoupleBuilderRow =>
            row != null &&
            typeof row === 'object' &&
            ('husbandId' in row || 'wifeId' in row)
        )
        .map((row) => ({
          husbandId:
            typeof row.husbandId === 'string' ? row.husbandId : null,
          wifeId: typeof row.wifeId === 'string' ? row.wifeId : null,
        })),
    };
  } catch {
    return null;
  }
}

export function storeCoupleBuilderDraft(
  draft: CoupleBuilderDraft,
  storage: Pick<Storage, 'setItem'>
): void {
  storage.setItem(coupleBuilderDraftStorageKey, JSON.stringify(draft));
}

export function clearCoupleBuilderDraft(
  storage: Pick<Storage, 'removeItem'>
): void {
  storage.removeItem(coupleBuilderDraftStorageKey);
}
