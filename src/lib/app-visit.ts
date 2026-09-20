import type { Session } from 'next-auth';

export type AppVisitRedirect = '/' | '/auth/awaiting-approval';

/**
 * Where a visitor must go instead of staying under /app.
 * null means they may remain (approved member).
 */
export function decideWhereAnAppVisitorMustGo(
  session: Session | null | undefined
): AppVisitRedirect | null {
  if (!session?.user) {
    return '/';
  }

  if (session.user.is_active) {
    return null;
  }

  return '/auth/awaiting-approval';
}
