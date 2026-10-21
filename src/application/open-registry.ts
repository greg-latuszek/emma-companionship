import { getRepositoryContainer } from '@/di/RepositoryProvider';
import { startDatabasePool } from '@/infrastructure/db/startup';
import type { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';

export function openRegistry(): IRepositoryContainer {
  startDatabasePool();
  return getRepositoryContainer();
}
