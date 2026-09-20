import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  reportAuthJsFailure,
  reportFailedGoogleMemberLookup,
  signInFailureCopy,
  UnavailableDatabase,
} from '@/lib/unavailable-database';

function givenARefusedPostgresConnection(): Error & {
  code: string;
  address: string;
  port: number;
} {
  const error = new Error('connect ECONNREFUSED 127.0.0.1:5433') as Error & {
    code: string;
    address: string;
    port: number;
  };
  error.code = 'ECONNREFUSED';
  error.address = '127.0.0.1';
  error.port = 5433;
  return error;
}

function capturingConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('unavailable database', () => {
  it('isUnavailableDatabase is true when Postgres refuses the connection', () => {
    const error = givenARefusedPostgresConnection();

    expect(isUnavailableDatabase(error)).toBe(true);
  });

  it('describeUnavailableDatabase tells the operator to start Postgres when the connection is refused', () => {
    const error = givenARefusedPostgresConnection();

    const description = describeUnavailableDatabase(error);

    expect(description).toContain('Postgres refused the connection at 127.0.0.1:5433');
    expect(description).toContain('npm run db:start');
  });

  it('reportFailedGoogleMemberLookup writes the operator sentence when Postgres refuses the connection', () => {
    const error = givenARefusedPostgresConnection();
    const logs = capturingConsoleError();

    reportFailedGoogleMemberLookup(error);

    expect(logs).toHaveBeenCalledWith(
      expect.stringContaining('Google sign-in cannot find or create the member')
    );
    expect(logs.mock.calls[0]?.[0]).toContain('npm run db:start');
  });

  it('reportAuthJsFailure names the hidden database outage when Auth.js wraps a refused connection', () => {
    const error = new Error('CallbackRouteError') as Error & { cause: Error };
    error.cause = new UnavailableDatabase(givenARefusedPostgresConnection());
    const logs = capturingConsoleError();

    reportAuthJsFailure(error);

    expect(logs.mock.calls[0]?.[0]).toContain('hid a database outage as a configuration error');
    expect(logs.mock.calls[0]?.[0]).toContain('npm run db:start');
  });

  it('signInFailureCopy tells a local operator to start the database when Auth.js reports Configuration', () => {
    const copy = signInFailureCopy('Configuration');

    expect(copy).toContain('npm run db:start');
    expect(copy).not.toMatch(/server configuration/i);
  });
});
