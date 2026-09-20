/**
 * Repository Provider
 * Dependency Injection for repository container
 *
 * Adapter selection is hardcoded for now (pg only).
 * Keep the switch so a second adapter can be added later without changing callers.
 */

import { IRepositoryContainer } from '@/ports/repositories/IRepositoryContainer';
import { PgRepositoryContainer } from '@/adapters/db/pg/PgRepositoryContainer';

const DB_ADAPTER = 'pg';

let container: IRepositoryContainer | null = null;

/**
 * Get the repository container for the configured adapter
 * DB_ADAPTER is hardcoded to 'pg' (pg library + raw SQL).
 * Any other value throws so unknown adapters fail loudly.
 */
export function getRepositoryContainer(): IRepositoryContainer {
  if (container) {
    return container;
  }

  switch (DB_ADAPTER) {
    case 'pg':
      container = new PgRepositoryContainer();
      break;
    default:
      throw new Error(`Unknown database adapter: ${DB_ADAPTER}`);
  }

  return container;
}

/**
 * Reset container (useful for testing)
 */
export function resetRepositoryContainer(): void {
  container = null;
}
