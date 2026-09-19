/**
 * Next.js server startup hook (src/instrumentation.ts).
 * pg is Node-only; skip Edge.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startDatabasePool } = await import('@/infrastructure/db/startup');
    startDatabasePool();
  }
}
