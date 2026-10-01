import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { closeConnection, query, truncateAllTables } from './db-connection';
import { closePool, initializePool } from '@/infrastructure/db/pg';
import { PgCompanionshipRelationRepository } from '@/adapters/db/pg/PgCompanionshipRelationRepository';

describe('PgCompanionshipRelationRepository.listPeopleWithoutCompanion', () => {
  const relations = new PgCompanionshipRelationRepository();

  beforeAll(() => {
    initializePool(
      process.env.DB_HOST || 'localhost',
      parseInt(process.env.DB_PORT || '5433', 10),
      process.env.DB_NAME_TEST || 'emma_companionship_test'
    );
  });

  afterEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closePool();
    await closeConnection();
  });

  async function addMember(
    firstName: string,
    lastName: string,
    engagement: string | null
  ): Promise<string> {
    const result = await query(
      `INSERT INTO members (first_name, last_name, community_engagement_status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [firstName, lastName, engagement]
    );
    return result.rows[0].id;
  }

  async function addRelation(
    companionId: string,
    accompaniedId: string,
    status: 'active' | 'archived' = 'active'
  ): Promise<void> {
    await query(
      `INSERT INTO companionship_relations (companion_id, accompanied_id, status)
       VALUES ($1, $2, $3)`,
      [companionId, accompaniedId, status]
    );
  }

  async function namesOfPeopleWithoutCompanion(): Promise<string[]> {
    const people = await relations.listPeopleWithoutCompanion();
    return people.map((person) => `${person.last_name} ${person.first_name}`);
  }

  it('listPeopleWithoutCompanion includes a committed member who is accompanied by nobody', async () => {
    await addMember('Piotr', 'Wiśniewski', 'Commited');

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).toEqual(['Wiśniewski Piotr']);
  });

  it('listPeopleWithoutCompanion includes a member whose engagement status is not filled in', async () => {
    await addMember('Maria', 'Zielińska', null);

    const people = await relations.listPeopleWithoutCompanion();

    expect(people).toHaveLength(1);
    expect(people[0]?.community_engagement_status).toBeNull();
  });

  it('listPeopleWithoutCompanion leaves out a Looker-On because they are not eligible', async () => {
    await addMember('Tomasz', 'Lewandowski', 'Looker-On');

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).toEqual([]);
  });

  it('listPeopleWithoutCompanion leaves out a member who is accompanied in an active relation', async () => {
    const anna = await addMember('Anna', 'Nowak', 'Fraternity');
    const piotr = await addMember('Piotr', 'Wiśniewski', 'Commited');
    await addRelation(anna, piotr);

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).toEqual(['Nowak Anna']);
  });

  it('listPeopleWithoutCompanion leaves out a member with an archived relation as accompanied', async () => {
    const anna = await addMember('Anna', 'Nowak', 'Fraternity');
    const piotr = await addMember('Piotr', 'Wiśniewski', 'Commited');
    await addRelation(anna, piotr, 'archived');

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).not.toContain('Wiśniewski Piotr');
  });

  it('listPeopleWithoutCompanion includes a member who is only someone else\'s companion', async () => {
    const anna = await addMember('Anna', 'Nowak', 'Fraternity');
    const piotr = await addMember('Piotr', 'Wiśniewski', 'Commited');
    await addRelation(anna, piotr);

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).toContain('Nowak Anna');
  });

  it('listPeopleWithoutCompanion sorts people by last name, then first name', async () => {
    await addMember('Zofia', 'Nowak', 'Commited');
    await addMember('Adam', 'Nowak', 'Commited');
    await addMember('Ewa', 'Kowalska', 'Commited');

    const names = await namesOfPeopleWithoutCompanion();

    expect(names).toEqual(['Kowalska Ewa', 'Nowak Adam', 'Nowak Zofia']);
  });
});
