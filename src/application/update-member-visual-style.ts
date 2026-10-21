import { openRegistry } from '@/application/open-registry';
import { reportFailedRegistryOperation } from '@/application/report-failed-registry-operation';
import type { IMemberRepository } from '@/ports/repositories/IMemberRepository';
import type { Member, MemberId, VisualStyle } from '@/types/auth';
import {
  isUnavailableDatabase,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

export class LoginMemberNotFound extends Error {
  constructor(readonly id: MemberId) {
    super(`The login member ${id} was not found`);
    this.name = 'LoginMemberNotFound';
  }
}

export function isLoginMemberNotFound(
  error: unknown
): error is LoginMemberNotFound {
  return error instanceof LoginMemberNotFound;
}

export async function updateMemberVisualStyle(
  id: MemberId,
  visualStyle: VisualStyle | null,
  members: IMemberRepository = openRegistry().getMemberRepository()
): Promise<Member> {
  try {
    const updated = await members.updateMemberVisualStyle(id, visualStyle);
    if (!updated) {
      throw new LoginMemberNotFound(id);
    }

    return updated;
  } catch (error) {
    if (isLoginMemberNotFound(error)) {
      throw error;
    }

    reportFailedRegistryOperation(error, {
      actor: 'The login member',
      cannot: 'store a visual style',
      failedWhile: 'storing a visual style',
    });
    if (isUnavailableDatabase(error)) {
      throw new UnavailableDatabase(error);
    }
    throw error;
  }
}
