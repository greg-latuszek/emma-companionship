// db/tests/schema.test.ts
// Integration tests for database schema creation and integrity

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { query, closeConnection, truncateAllTables } from './db-connection';

describe('Database Schema Validation', () => {
  beforeAll(() => {
    // Pool is initialized when first query runs
  });

  afterEach(async () => {
    // Clean up after each test
    await truncateAllTables();
  });

  afterAll(async () => {
    // Close connection after all tests
    await closeConnection();
  });

  describe('Schema Tables', () => {
    it('should have _schema_migrations table', async () => {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '_schema_migrations'
      `);
      expect(result.rows).toHaveLength(1);
    });

    it('should have members table', async () => {
      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'members'
      `);
      expect(result.rows).toHaveLength(1);
    });

           it('should have all required tables', async () => {
             const expectedTables = [
               '_schema_migrations',
               'members',
               'couples',
               'roles',
               'geographic_units',
               'role_assignments',
               'blacklist',
               'security_events',
               'approval_audit',
               'auth_events',
               'two_factor_auth',
               'companionship_relations',
             ];

      const result = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      const tableNames = result.rows.map((row: any) => row.table_name).sort();
      expect(tableNames).toEqual(expectedTables.sort());
    });
  });

  describe('Members Table Structure', () => {
    it('should have correct columns', async () => {
      const result = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'members'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row: any) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable,
      }));

      // Verify key columns exist
      const columnNames = columns.map((c: any) => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('password_hash');
      expect(columnNames).toContain('oauth_provider');
      expect(columnNames).toContain('oauth_id');
      expect(columnNames).toContain('is_active');
      expect(columnNames).toContain('requested_at');
      expect(columnNames).toContain('approved_by');
      expect(columnNames).toContain('registry_check_result');
      expect(columnNames).toContain('visual_style');
    });

    it('should have visual_style nullable so empty means the default', async () => {
      const result = await query(`
        SELECT is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'visual_style'
      `);

      expect(result.rows[0].is_nullable).toBe('YES');
      expect(result.rows[0].column_default).toBeNull();
    });

           it('should have email partial unique index for app_users', async () => {
             const result = await query(`
               SELECT indexname
               FROM pg_indexes
               WHERE tablename = 'members' AND indexname LIKE '%email%'
             `);

             const indexes = result.rows.map((row: any) => row.indexname);
             expect(indexes.length).toBeGreaterThan(0);
             expect(indexes.some((idx: string) => idx.includes('app_users'))).toBe(true);
           });

    it('should have oauth unique constraint', async () => {
      const result = await query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'members' AND constraint_type = 'UNIQUE'
      `);

      const constraints = result.rows.map((row: any) => row.constraint_name);
      expect(constraints).toContain('unique_oauth');
    });

    it('should have is_active default FALSE', async () => {
      const result = await query(`
        SELECT column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'is_active'
      `);

      expect(result.rows[0].column_default).toContain('false');
    });
  });

  describe('Roles Table Structure', () => {
    it('should have correct columns', async () => {
      const result = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'roles'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('name');
      expect(columns).toContain('level');
      expect(columns).toContain('description');
      expect(columns).toContain('created_at');
    });

    it('should have name and level columns (no is_active or updated_at)', async () => {
      const result = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'roles'
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      expect(columns).toContain('name');
      expect(columns).toContain('level');
      expect(columns).not.toContain('is_active');
      expect(columns).not.toContain('updated_at');
    });

    it('should have level constraint', async () => {
      const result = await query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'roles' AND constraint_type = 'CHECK'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should enforce unique role matrix (name + level)', async () => {
      const result = await query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'roles' AND constraint_type = 'UNIQUE'
      `);

      const constraints = result.rows.map((row: any) => row.constraint_name);
      expect(constraints.some((c: string) => c.includes('unique'))).toBe(true);
    });
  });

  describe('Role Assignments Table Structure', () => {
    it('should have correct columns', async () => {
      const result = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'role_assignments'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      expect(columns).toContain('id');
      expect(columns).toContain('member_id');
      expect(columns).toContain('role_id');
      expect(columns).toContain('scope_id');
      expect(columns).toContain('assigned_by');
      expect(columns).toContain('assigned_at');
      expect(columns).toContain('revoked_by');
      expect(columns).toContain('revoked_at');
    });

    it('should not have is_active or updated_at columns', async () => {
      const result = await query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'role_assignments'
      `);

      const columns = result.rows.map((row: any) => row.column_name);
      expect(columns).not.toContain('is_active');
      expect(columns).not.toContain('updated_at');
      expect(columns).not.toContain('created_at');
    });

    it('should have scope_id nullable', async () => {
      const result = await query(`
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'role_assignments' AND column_name = 'scope_id'
      `);

      expect(result.rows[0].is_nullable).toBe('YES');
    });

    it('should have revoked_at nullable', async () => {
      const result = await query(`
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'role_assignments' AND column_name = 'revoked_at'
      `);

      expect(result.rows[0].is_nullable).toBe('YES');
    });
  });

  describe('Indexes', () => {
    it('should have indexes on members table', async () => {
      const result = await query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'members'
      `);

      const indexes = result.rows.map((row: any) => row.indexname);
      expect(indexes.length).toBeGreaterThan(3); // At least pk + 4 business indexes
      expect(indexes.some((idx: string) => idx.includes('email'))).toBe(true);
      expect(indexes.some((idx: string) => idx.includes('is_active'))).toBe(true);
    });

    it('should have indexes on security_events', async () => {
      const result = await query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'security_events'
      `);

      const indexes = result.rows.map((row: any) => row.indexname);
      expect(indexes.length).toBeGreaterThanOrEqual(4);
    });

    it('should have partial unique index on blacklist', async () => {
      const result = await query(`
        SELECT indexdef
        FROM pg_indexes
        WHERE tablename = 'blacklist' AND indexname LIKE '%active_email%'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].indexdef).toContain('WHERE');
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should have foreign keys on role_assignments', async () => {
      const result = await query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'role_assignments' AND constraint_type = 'FOREIGN KEY'
      `);

      expect(result.rows.length).toBeGreaterThanOrEqual(3); // member_id, role_id, unit_id
    });

    it('should have foreign keys on two_factor_auth', async () => {
      const result = await query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'two_factor_auth' AND constraint_type = 'FOREIGN KEY'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });
  });

  describe('Data Type Validation', () => {
    it('should have UUID primary keys', async () => {
      const result = await query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'members' 
        AND column_name = 'id'
      `);

      expect(result.rows[0].data_type).toBe('uuid');
    });

    it('should have JSONB for registry_check_result', async () => {
      const result = await query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'members' 
        AND column_name = 'registry_check_result'
      `);

      expect(result.rows[0].data_type).toBe('jsonb');
    });

    it('should have INET for ip_address', async () => {
      const result = await query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'security_events' 
        AND column_name = 'ip_address'
      `);

      expect(result.rows[0].data_type).toBe('inet');
    });

    it('should have TEXT[] for backup_codes', async () => {
      const result = await query(`
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'two_factor_auth' 
        AND column_name = 'backup_codes'
      `);

      // PostgreSQL returns 'ARRAY' for array types
      expect(result.rows[0].data_type).toMatch(/^(ARRAY|text\[\])$/);
    });
  });

  describe('Constraints and Rules', () => {
           it('should enforce NOT NULL on core required members columns', async () => {
             const result = await query(`
               SELECT column_name, is_nullable
               FROM information_schema.columns
               WHERE table_schema = 'public' 
               AND table_name = 'members'
               AND column_name IN ('first_name', 'last_name', 'requested_at')
             `);

             result.rows.forEach((row: any) => {
               expect(row.is_nullable).toBe('NO');
             });
           });

           it('should allow NULL for optional auth and contact fields', async () => {
             const result = await query(`
               SELECT column_name, is_nullable
               FROM information_schema.columns
               WHERE table_schema = 'public' 
               AND table_name = 'members'
               AND column_name IN ('password_hash', 'oauth_provider', 'oauth_id', 'email', 'phone')
             `);

             result.rows.forEach((row: any) => {
               expect(row.is_nullable).toBe('YES');
             });
           });
  });

  describe('Extensions', () => {
    it('should have uuid-ossp extension', async () => {
      const result = await query(`
        SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
      `);

      expect(result.rows).toHaveLength(1);
    });

    it('should have pgcrypto extension', async () => {
      const result = await query(`
        SELECT extname FROM pg_extension WHERE extname = 'pgcrypto'
      `);

      expect(result.rows).toHaveLength(1);
    });
  });

  describe('Migration Tracking', () => {
    it('should record exactly one migration row for the squashed initial schema', async () => {
      const result = await query(`
        SELECT version, description
        FROM _schema_migrations
        ORDER BY version
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].version).toBe(1);
    });
  });
});
