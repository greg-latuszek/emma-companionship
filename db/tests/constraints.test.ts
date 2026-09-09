// db/tests/constraints.test.ts
// Integration tests for database constraints and business logic

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { query, closeConnection, truncateAllTables } from './db-connection';

describe('Database Constraints & Business Logic', () => {
  beforeAll(() => {
    // Pool initialized on first query
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('Members Table Constraints', () => {
    it('should enforce unique email', async () => {
      // Insert first member
      await query(`
        INSERT INTO members (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789')
      `);

      // Try to insert duplicate email - should fail
      let error: any;
      try {
        await query(`
          INSERT INTO members (first_name, last_name, email, phone)
          VALUES ('Jane', 'Doe', 'john@example.com', '+48987654321')
        `);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('duplicate');
    });

    it('should enforce unique oauth combination', async () => {
      const oauth_id = 'google_123456';

      // Insert first OAuth member
      await query(`
        INSERT INTO members (first_name, last_name, email, phone, oauth_provider, oauth_id)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789', 'google', $1)
      `, [oauth_id]);

      // Try to insert duplicate oauth - should fail
      let error: any;
      try {
        await query(`
          INSERT INTO members (first_name, last_name, email, phone, oauth_provider, oauth_id)
          VALUES ('Jane', 'Doe', 'jane@example.com', '+48987654321', 'google', $1)
        `, [oauth_id]);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('duplicate');
    });

    it('should set is_active to FALSE by default', async () => {
      await query(`
        INSERT INTO members (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789')
      `);

      const result = await query(`
        SELECT is_active FROM members WHERE email = 'john@example.com'
      `);

      expect(result.rows[0].is_active).toBe(false);
    });

    it('should set requested_at to current timestamp', async () => {
      const beforeInsert = new Date();
      await query(`
        INSERT INTO members (first_name, last_name, email, phone)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789')
      `);
      const afterInsert = new Date();

      const result = await query(`
        SELECT requested_at FROM members WHERE email = 'john@example.com'
      `);

      const requestedAt = new Date(result.rows[0].requested_at);
      expect(requestedAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
      expect(requestedAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
    });

    it('should allow NULL password for OAuth-only members', async () => {
      await query(`
        INSERT INTO members (first_name, last_name, email, phone, oauth_provider, oauth_id, password_hash)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789', 'google', 'google_123', NULL)
      `);

      const result = await query(`
        SELECT password_hash FROM members WHERE email = 'john@example.com'
      `);

      expect(result.rows[0].password_hash).toBeNull();
    });

    it('should allow storing registry_check_result as JSONB', async () => {
      const checkResult = {
        emailMatch: true,
        phoneMatch: false,
        nameMatch: true,
        recommendation: 'Verify phone',
        checked_at: new Date().toISOString(),
      };

      await query(`
        INSERT INTO members (first_name, last_name, email, phone, registry_check_result)
        VALUES ('John', 'Doe', 'john@example.com', '+48123456789', $1)
      `, [JSON.stringify(checkResult)]);

      const result = await query(`
        SELECT registry_check_result FROM members WHERE email = 'john@example.com'
      `);

      expect(result.rows[0].registry_check_result).toEqual(checkResult);
    });
  });

  describe('Blacklist Constraints', () => {
    it('should prevent duplicate active email in blacklist', async () => {
      const adminId = '550e8400-e29b-41d4-a716-446655440000'; // Mock UUID

      // Insert first blacklist entry
      await query(`
        INSERT INTO blacklist (email, reason, blacklisted_by)
        VALUES ('hacker@example.com', 'suspected_hacker', $1)
      `, [adminId]);

      // Try to insert duplicate - should fail
      let error: any;
      try {
        await query(`
          INSERT INTO blacklist (email, reason, blacklisted_by)
          VALUES ('hacker@example.com', 'DoS_attempt', $1)
        `, [adminId]);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('duplicate');
    });

    it('should allow duplicate email if previous entry is unblacklisted', async () => {
      const adminId = '550e8400-e29b-41d4-a716-446655440000';

      // Insert and unblock first entry
      await query(`
        INSERT INTO blacklist (email, reason, blacklisted_by, is_active)
        VALUES ('user@example.com', 'mistake', $1, false)
      `, [adminId]);

      // Insert new entry with same email - should succeed
      const result = await query(`
        INSERT INTO blacklist (email, reason, blacklisted_by, is_active)
        VALUES ('user@example.com', 'real_issue', $1, true)
        RETURNING id
      `, [adminId]);

      expect(result.rows).toHaveLength(1);
    });

    it('should enforce unique active OAuth in blacklist', async () => {
      const adminId = '550e8400-e29b-41d4-a716-446655440000';

      // Insert first OAuth blacklist
      await query(`
        INSERT INTO blacklist (oauth_provider, oauth_id, reason, blacklisted_by)
        VALUES ('google', 'google_hacker_123', 'DoS_attempt', $1)
      `, [adminId]);

      // Try duplicate - should fail
      let error: any;
      try {
        await query(`
          INSERT INTO blacklist (oauth_provider, oauth_id, reason, blacklisted_by)
          VALUES ('google', 'google_hacker_123', 'repeated_attack', $1)
        `, [adminId]);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
    });

    it('should allow unblacklisting and reblacklisting', async () => {
      const adminId = '550e8400-e29b-41d4-a716-446655440000';
      const unblockAdminId = '660e8400-e29b-41d4-a716-446655440001';

      // Insert and block
      const insertResult = await query(`
        INSERT INTO blacklist (email, reason, blacklisted_by, is_active)
        VALUES ('user@example.com', 'initial_block', $1, true)
        RETURNING id
      `, [adminId]);

      const blacklistId = insertResult.rows[0].id;

      // Unblock
      await query(`
        UPDATE blacklist 
        SET is_active = false, unblacklisted_by = $1, unblacklisted_at = NOW()
        WHERE id = $2
      `, [unblockAdminId, blacklistId]);

      // Re-block with same email should succeed
      const reblockResult = await query(`
        INSERT INTO blacklist (email, reason, blacklisted_by, is_active)
        VALUES ('user@example.com', 'repeat_offense', $1, true)
        RETURNING id
      `, [adminId]);

      expect(reblockResult.rows).toHaveLength(1);
    });
  });

  describe('Role Assignments', () => {
    it('should track role assignment history', async () => {
      const memberId = '750e8400-e29b-41d4-a716-446655440000';
      const roleId = '850e8400-e29b-41d4-a716-446655440000';
      const adminId = '950e8400-e29b-41d4-a716-446655440000';

      // Create member first (FK requirement)
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'John', 'Doe', 'john@example.com', '+48123456789')
      `, [memberId]);

      // Create admin member
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'Admin', 'User', 'admin@example.com', '+48999999999')
      `, [adminId]);

      // Create role
      await query(`
        INSERT INTO roles (id, name, description)
        VALUES ($1, 'admin', 'Administrator')
      `, [roleId]);

      // Assign role
      const assignResult = await query(`
        INSERT INTO role_assignments (member_id, role_id, assigned_by, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING assigned_at
      `, [memberId, roleId, adminId]);

      const assignedAt = new Date(assignResult.rows[0].assigned_at);
      expect(assignedAt.getTime()).toBeGreaterThan(0);
    });

    it('should enforce partial unique index on active assignments', async () => {
      const memberId = '750e8400-e29b-41d4-a716-446655440000';
      const roleId = '850e8400-e29b-41d4-a716-446655440000';
      const adminId = '950e8400-e29b-41d4-a716-446655440000';
      const unitId = 'a50e8400-e29b-41d4-a716-446655440000';

      // Create member
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'John', 'Doe', 'john@example.com', '+48123456789')
      `, [memberId]);

      // Create admin
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'Admin', 'User', 'admin@example.com', '+48999999999')
      `, [adminId]);

      // Create test data
      await query(`
        INSERT INTO roles (id, name, description)
        VALUES ($1, 'admin', 'Administrator')
      `, [roleId]);

      await query(`
        INSERT INTO geographic_units (id, name)
        VALUES ($1, 'Test Unit')
      `, [unitId]);

      // First assignment
      await query(`
        INSERT INTO role_assignments (member_id, role_id, geographic_unit_id, assigned_by, is_active)
        VALUES ($1, $2, $3, $4, true)
      `, [memberId, roleId, unitId, adminId]);

      // Duplicate active assignment should fail
      let error: any;
      try {
        await query(`
          INSERT INTO role_assignments (member_id, role_id, geographic_unit_id, assigned_by, is_active)
          VALUES ($1, $2, $3, $4, true)
        `, [memberId, roleId, unitId, adminId]);
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
    });
  });

  describe('Auth Events Logging', () => {
    it('should log auth events with proper data types', async () => {
      const memberId = '750e8400-e29b-41d4-a716-446655440000';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      // Create member first
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'John', 'Doe', 'john@example.com', '+48123456789')
      `, [memberId]);

      const result = await query(`
        INSERT INTO auth_events (member_id, event_type, provider, ip_address, user_agent, success)
        VALUES ($1, $2, $3, $4::inet, $5, true)
        RETURNING id, created_at, ip_address
      `, [memberId, 'login', 'google', ipAddress, userAgent]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].ip_address).toBe(ipAddress);
    });
  });

  describe('Security Events Audit Trail', () => {
    it('should log security events with severity levels', async () => {
      const result = await query(`
        INSERT INTO security_events (event_type, email, reason, severity)
        VALUES ('duplicate_prevented', 'spammer@example.com', 'Multiple registrations', 'warning')
        RETURNING id, created_at, severity
      `);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].severity).toBe('warning');
    });
  });

  describe('Two Factor Auth Table', () => {
    it('should store 2FA configuration', async () => {
      const memberId = '750e8400-e29b-41d4-a716-446655440000';
      const secret = 'JBSWY3DPEBLW64TMMQ======'; // Example base32 secret

      // Create member first
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'John', 'Doe', 'john@example.com', '+48123456789')
      `, [memberId]);

      const result = await query(`
        INSERT INTO two_factor_auth (member_id, method, secret, enabled, backup_codes)
        VALUES ($1, $2, $3, false, ARRAY['code1', 'code2', 'code3'])
        RETURNING id, method, enabled, backup_codes
      `, [memberId, 'totp', secret]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].method).toBe('totp');
      expect(result.rows[0].enabled).toBe(false);
      expect(result.rows[0].backup_codes).toHaveLength(3);
    });

    it('should cascade delete 2FA when member is deleted', async () => {
      const memberId = '750e8400-e29b-41d4-a716-446655440000';

      // Insert member
      await query(`
        INSERT INTO members (id, first_name, last_name, email, phone)
        VALUES ($1, 'John', 'Doe', 'john@example.com', '+48123456789')
      `, [memberId]);

      // Insert 2FA
      await query(`
        INSERT INTO two_factor_auth (member_id, method, secret, backup_codes)
        VALUES ($1, 'totp', 'JBSWY3DPEBLW64TMMQ======', ARRAY['code1'])
      `, [memberId]);

      // Delete member
      await query(`
        DELETE FROM members WHERE id = $1
      `, [memberId]);

      // 2FA should be deleted
      const result = await query(`
        SELECT COUNT(*) as count FROM two_factor_auth WHERE member_id = $1
      `, [memberId]);

      expect(result.rows[0].count).toBe('0');
    });
  });
});
