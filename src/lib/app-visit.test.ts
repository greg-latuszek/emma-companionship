import { describe, expect, it } from 'vitest';
import type { Session } from 'next-auth';
import { decideWhereAnAppVisitorMustGo } from '@/lib/app-visit';

function aSession(user: Session['user']): Session {
  return {
    user,
    expires: '2099-01-01T00:00:00.000Z',
  };
}

describe('decideWhereAnAppVisitorMustGo', () => {
  it('decideWhereAnAppVisitorMustGo sends a visitor home when there is no session', () => {
    expect(decideWhereAnAppVisitorMustGo(null)).toBe('/');
    expect(decideWhereAnAppVisitorMustGo(undefined)).toBe('/');
  });

  it('decideWhereAnAppVisitorMustGo sends a pending member to awaiting-approval', () => {
    const destination = decideWhereAnAppVisitorMustGo(
      aSession({ email: 'ada@example.com', is_active: false })
    );

    expect(destination).toBe('/auth/awaiting-approval');
  });

  it('decideWhereAnAppVisitorMustGo treats a missing is_active flag as pending', () => {
    const destination = decideWhereAnAppVisitorMustGo(
      aSession({ email: 'ada@example.com' })
    );

    expect(destination).toBe('/auth/awaiting-approval');
  });

  it('decideWhereAnAppVisitorMustGo lets an approved member stay on /app', () => {
    const destination = decideWhereAnAppVisitorMustGo(
      aSession({ email: 'ada@example.com', is_active: true })
    );

    expect(destination).toBeNull();
  });
});
