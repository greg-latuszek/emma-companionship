import { describeUnavailableDatabase, isUnavailableDatabase } from '@/lib/unavailable-database';

export type RegistryOperation = {
  actor: 'The registry' | 'The login member';
  cannot: string;
  failedWhile: string;
};

export function reportFailedRegistryOperation(error: unknown, operation: RegistryOperation): void {
  if (isUnavailableDatabase(error)) {
    console.error(
      `[emma] ${operation.actor} cannot ${operation.cannot}. ${describeUnavailableDatabase(error)}`
    );
    return;
  }

  console.error(`[emma] ${operation.actor} failed while ${operation.failedWhile}.`, error);
}
