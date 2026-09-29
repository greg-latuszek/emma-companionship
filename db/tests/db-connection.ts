// db/tests/db-connection.ts
// Shared database connection utility for integration tests

import { Pool, QueryResult, QueryResultRow } from 'pg';

// Use test database for tests
const DB_USER = process.env.DB_USER || 'devuser';
const DB_PASSWORD = process.env.DB_PASSWORD || 'devpassword';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5433';
const DB_NAME = process.env.DB_NAME_TEST || 'emma_companionship_test';

let pool: Pool | null = null;

/**
 * Get or create a database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: parseInt(DB_PORT),
      database: DB_NAME,
    });
  }
  return pool;
}

/**
 * Execute a raw SQL query
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  values?: unknown[]
): Promise<QueryResult<T>> {
  const client = getPool();
  return client.query<T>(sql, values);
}

/**
 * Close database connection (call in test cleanup)
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Truncate all tables (reset state between tests)
 */
export async function truncateAllTables(): Promise<void> {
  const tables = [
    'role_assignments',
    'auth_events',
    'approval_audit',
    'security_events',
    'blacklist',
    'two_factor_auth',
    'companionship_relations',
    'members',
    'geographic_units',
    'roles',
  ];

  for (const table of tables) {
    try {
      await query(`TRUNCATE TABLE ${table} CASCADE;`);
    } catch (error) {
      // Table might not exist, that's OK
    }
  }
}
