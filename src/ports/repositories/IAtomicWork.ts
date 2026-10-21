/**
 * One registry transaction.
 * Implementation: PgAtomicWork (pg library + raw SQL).
 * A use case calls runAsAtomic. It does not see a database client.
 */

export class AtomicBlockAlreadyOpen extends Error {
  constructor() {
    super('An atomic block is already open');
    this.name = 'AtomicBlockAlreadyOpen';
  }
}

export interface IAtomicWork {
  runAsAtomic<T>(work: () => Promise<T>): Promise<T>;
}
