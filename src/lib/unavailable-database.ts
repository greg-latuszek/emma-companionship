const OPERATOR_PREFIX = '[emma]';

export class UnavailableDatabase extends Error {
  readonly code = 'UNAVAILABLE_DATABASE';

  constructor(cause: unknown) {
    super(describeUnavailableDatabase(cause));
    this.name = 'UnavailableDatabase';
    this.cause = cause;
  }
}

export function isConnectionRefused(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  return code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED');
}

export function isUnavailableDatabase(error: unknown): boolean {
  if (error instanceof UnavailableDatabase) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
    return true;
  }

  return (
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('timeout exceeded when trying to connect') ||
    error.message.includes('Database pool not initialized')
  );
}

export function rootCause(error: unknown): unknown {
  let current = error;
  const seen = new Set<unknown>();

  while (
    current &&
    typeof current === 'object' &&
    'cause' in current &&
    (current as { cause: unknown }).cause !== undefined &&
    !seen.has(current)
  ) {
    seen.add(current);
    current = (current as { cause: unknown }).cause;
  }

  return current;
}

export function describeUnavailableDatabase(error: unknown): string {
  const failure = rootCause(error);
  const address = connectionAddress(failure);

  if (isConnectionRefused(failure)) {
    return `Postgres refused the connection at ${address}. Start it with npm run db:start.`;
  }

  return `Postgres is unreachable at ${address}. Start it with npm run db:start.`;
}

export function reportFailedGoogleMemberLookup(error: unknown): void {
  const failure = rootCause(error);

  if (isUnavailableDatabase(failure) || isUnavailableDatabase(error)) {
    console.error(`${OPERATOR_PREFIX} Google sign-in cannot find or create the member. ${describeUnavailableDatabase(failure)}`);
    return;
  }

  console.error(
    `${OPERATOR_PREFIX} Google sign-in failed while finding or creating the member.`,
    error
  );
}

export function reportAuthJsFailure(error: Error): void {
  const failure = rootCause(error);

  if (isUnavailableDatabase(failure) || isUnavailableDatabase(error)) {
    console.error(`${OPERATOR_PREFIX} Auth.js hid a database outage as a configuration error. ${describeUnavailableDatabase(failure)}`);
    return;
  }

  console.error(`${OPERATOR_PREFIX} Auth.js failed.`, error);
}

export function signInFailureCopy(errorCode: string | undefined): string {
  if (errorCode === 'Configuration') {
    return 'Nie udało się dokończyć logowania. Jeśli uruchamiasz serwis lokalnie, uruchom bazę poleceniem npm run db:start i spróbuj ponownie.';
  }

  return 'Nie udało się dokończyć logowania. Spróbuj ponownie.';
}

function connectionAddress(error: unknown): string {
  if (error && typeof error === 'object') {
    const { address, port } = error as { address?: string; port?: number };
    if (address && port !== undefined) {
      return `${address}:${port}`;
    }
  }

  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  return `${host}:${port}`;
}
