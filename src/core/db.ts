/**
 * Database Connection Pool
 * Direct pg library connection (no ORM)
 * Reusable by any backend (Node.js, Python, etc)
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

/**
 * Initialize the database pool
 * Should be called once at application startup
 */
export function initializePool(
  host: string = process.env.DB_HOST || 'localhost',
  port: number = parseInt(process.env.DB_PORT || '5432', 10),
  database: string = process.env.DB_NAME || 'emma_companionship_dev',
  user: string = process.env.DB_USER || 'devuser',
  password: string = process.env.DB_PASSWORD || 'devpass'
): Pool {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

/**
 * Get the current pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call initializePool() first.'
    );
  }
  return pool;
}

/**
 * Close the database pool
 * Should be called on application shutdown
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Generic query function
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, values);
}

/**
 * Get a single row
 */
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  values?: any[]
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

/**
 * Get multiple rows
 */
export async function queryMany<T extends QueryResultRow = any>(
  text: string,
  values?: any[]
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

/**
 * Transaction helper
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
