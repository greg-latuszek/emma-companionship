import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  describeUnavailableDatabase,
  isUnavailableDatabase,
  operatorHintsAreEnabled,
  reportAuthJsFailure,
  reportFailedOAuthMemberRecognition,
  signInFailureMessageKey,
  UnavailableDatabase,
} from '@/lib/unavailable-database';
import { messagesFor } from '@/i18n/messages';

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

  it('reportFailedOAuthMemberRecognition writes the operator sentence when Postgres refuses the connection', () => {
    const error = givenARefusedPostgresConnection();
    const logs = capturingConsoleError();

    reportFailedOAuthMemberRecognition(error);

    expect(logs).toHaveBeenCalledWith(
      expect.stringContaining('OAuth sign-in cannot find or create the member')
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

  it('operatorHintsAreEnabled is true when OPERATOR_HINTS is 1 even in production', () => {
    expect(
      operatorHintsAreEnabled({ NODE_ENV: 'production', OPERATOR_HINTS: '1' })
    ).toBe(true);
  });

  it('operatorHintsAreEnabled is true when NODE_ENV is development', () => {
    expect(operatorHintsAreEnabled({ NODE_ENV: 'development' })).toBe(true);
  });

  it('operatorHintsAreEnabled is false when the process is production and OPERATOR_HINTS is unset', () => {
    expect(operatorHintsAreEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('signInFailureMessageKey tells a local operator to read the server log when operator hints are on', () => {
    const key = signInFailureMessageKey({ NODE_ENV: 'development' });

    expect(key).toBe('auth.signInFailedLocal');
    for (const locale of ['en-GB', 'pl-PL'] as const) {
      expect(messagesFor(locale)[key]).not.toMatch(/npm|postgres|baz[aę]/i);
    }
  });

  it('signInFailureMessageKey hides how the server runs when operator hints are off', () => {
    const key = signInFailureMessageKey({ NODE_ENV: 'production' });

    expect(key).toBe('auth.signInFailed');
    for (const locale of ['en-GB', 'pl-PL'] as const) {
      expect(messagesFor(locale)[key]).not.toMatch(/npm|logi serwera|lokalnie|server logs|locally/i);
    }
  });
});
