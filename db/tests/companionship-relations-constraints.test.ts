import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import {
  query,
  closeConnection,
  truncateAllTables,
} from './db-connection';

describe('Companionship Relations Constraints', () => {
  beforeAll(() => {
    // Pool is initialized when first query runs.
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closeConnection();
  });

  async function addMember(firstName: string, lastName: string): Promise<string> {
    const result = await query(
      `INSERT INTO members (first_name, last_name)
       VALUES ($1, $2)
       RETURNING id`,
      [firstName, lastName]
    );
    return result.rows[0].id;
  }

  it('prevents a member from accompanying themselves', async () => {
    const memberId = await addMember('Jan', 'Kowalski');

    let error: unknown;
    try {
      await query(
        `INSERT INTO companionship_relations (companion_id, accompanied_id)
         VALUES ($1, $1)`,
        [memberId]
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });

  it('prevents duplicate active relations between the same two members', async () => {
    const companionId = await addMember('Anna', 'Nowak');
    const accompaniedId = await addMember('Piotr', 'Wiśniewski');

    await query(
      `INSERT INTO companionship_relations (companion_id, accompanied_id)
       VALUES ($1, $2)`,
      [companionId, accompaniedId]
    );

    let error: unknown;
    try {
      await query(
        `INSERT INTO companionship_relations (companion_id, accompanied_id)
         VALUES ($1, $2)`,
        [companionId, accompaniedId]
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });

  it('allows a new active relation after the previous one is archived', async () => {
    const companionId = await addMember('Anna', 'Nowak');
    const accompaniedId = await addMember('Piotr', 'Wiśniewski');

    const first = await query(
      `INSERT INTO companionship_relations (companion_id, accompanied_id)
       VALUES ($1, $2)
       RETURNING id`,
      [companionId, accompaniedId]
    );

    await query(
      `UPDATE companionship_relations
       SET status = 'archived'
       WHERE id = $1`,
      [first.rows[0].id]
    );

    const second = await query(
      `INSERT INTO companionship_relations (companion_id, accompanied_id)
       VALUES ($1, $2)
       RETURNING id`,
      [companionId, accompaniedId]
    );

    expect(second.rows).toHaveLength(1);
  });

  it('rejects an end_date earlier than the start_date', async () => {
    const companionId = await addMember('Anna', 'Nowak');
    const accompaniedId = await addMember('Piotr', 'Wiśniewski');

    let error: unknown;
    try {
      await query(
        `INSERT INTO companionship_relations (
          companion_id, accompanied_id, start_date, end_date
         )
         VALUES ($1, $2, '2024-01-15', '2024-01-10')`,
        [companionId, accompaniedId]
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
  });
});
