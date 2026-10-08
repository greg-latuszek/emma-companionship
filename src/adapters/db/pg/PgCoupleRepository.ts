/**
 * PgCoupleRepository — couple registry adapter.
 * member1_id = husband, member2_id = wife. Writes set members.couple_id in the same transaction.
 */

import { queryMany, queryOne, withTransaction } from '@/infrastructure/db/pg';
import type { ICoupleRepository } from '@/ports/repositories/ICoupleRepository';
import type { CoupleWrite } from '@/schemas/couple';
import { MemberId } from '@/types/auth';
import type { Gender } from '@/types/community-member';
import type {
  Couple,
  CoupleListItem,
  CoupleParticipant,
  MarriedPersonWithoutCouple,
} from '@/types/couple';

const COUPLE_PARTICIPANT_COLUMNS = `
  id, first_name, last_name, gender, email, phone, notes
`;

type CoupleParticipantRow = {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

type CoupleListRow = {
  id: string;
  husband_id: string;
  husband_first_name: string;
  husband_last_name: string;
  husband_gender: Gender;
  husband_email: string | null;
  husband_phone: string | null;
  husband_notes: string | null;
  wife_id: string;
  wife_first_name: string;
  wife_last_name: string;
  wife_gender: Gender;
  wife_email: string | null;
  wife_phone: string | null;
  wife_notes: string | null;
};

function coupleParticipantFromRow(row: CoupleParticipantRow): CoupleParticipant {
  return {
    id: MemberId(row.id),
    first_name: row.first_name,
    last_name: row.last_name,
    gender: row.gender,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
  };
}

function coupleListItemFromRow(row: CoupleListRow): CoupleListItem {
  return {
    id: row.id,
    husband: {
      id: MemberId(row.husband_id),
      first_name: row.husband_first_name,
      last_name: row.husband_last_name,
      gender: row.husband_gender,
      email: row.husband_email,
      phone: row.husband_phone,
      notes: row.husband_notes,
    },
    wife: {
      id: MemberId(row.wife_id),
      first_name: row.wife_first_name,
      last_name: row.wife_last_name,
      gender: row.wife_gender,
      email: row.wife_email,
      phone: row.wife_phone,
      notes: row.wife_notes,
    },
  };
}

export class PgCoupleRepository implements ICoupleRepository {
  async listCouples(): Promise<CoupleListItem[]> {
    const rows = await queryMany<CoupleListRow>(`
      SELECT
        c.id,
        husband.id AS husband_id,
        husband.first_name AS husband_first_name,
        husband.last_name AS husband_last_name,
        husband.gender AS husband_gender,
        husband.email AS husband_email,
        husband.phone AS husband_phone,
        husband.notes AS husband_notes,
        wife.id AS wife_id,
        wife.first_name AS wife_first_name,
        wife.last_name AS wife_last_name,
        wife.gender AS wife_gender,
        wife.email AS wife_email,
        wife.phone AS wife_phone,
        wife.notes AS wife_notes
      FROM couples c
      JOIN members husband ON husband.id = c.member1_id
      JOIN members wife ON wife.id = c.member2_id
      ORDER BY husband.last_name, husband.first_name, wife.last_name, wife.first_name
    `);
    return rows.map(coupleListItemFromRow);
  }

  async listMarriedPeopleWithoutCouple(): Promise<MarriedPersonWithoutCouple[]> {
    const rows = await queryMany<CoupleParticipantRow>(`
      SELECT ${COUPLE_PARTICIPANT_COLUMNS}
      FROM members
      WHERE marital_status = 'married'
        AND gender IN ('male', 'female')
        AND couple_id IS NULL
      ORDER BY last_name, first_name
    `);
    return rows.map(coupleParticipantFromRow);
  }

  async findCoupleById(id: string): Promise<Couple | null> {
    const row = await queryOne<{
      id: string;
      member1_id: string;
      member2_id: string;
    }>(
      `
      SELECT id, member1_id, member2_id
      FROM couples
      WHERE id = $1
    `,
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      member1_id: MemberId(row.member1_id),
      member2_id: MemberId(row.member2_id),
    };
  }

  async addCouple(write: CoupleWrite): Promise<Couple> {
    return withTransaction(async (client) => {
      const insertResult = await client.query<{
        id: string;
        member1_id: string;
        member2_id: string;
      }>(
        `
        INSERT INTO couples (member1_id, member2_id)
        VALUES ($1, $2)
        RETURNING id, member1_id, member2_id
      `,
        [write.husband_id, write.wife_id]
      );

      const row = insertResult.rows[0];
      if (!row) {
        throw new Error('Failed to insert couple');
      }

      await client.query(
        `
        UPDATE members
        SET couple_id = $1, updated_at = NOW()
        WHERE id = ANY($2::uuid[])
      `,
        [row.id, [write.husband_id, write.wife_id]]
      );

      return {
        id: row.id,
        member1_id: MemberId(row.member1_id),
        member2_id: MemberId(row.member2_id),
      };
    });
  }

  async removeCouple(id: string): Promise<void> {
    await queryOne(
      `
      DELETE FROM couples
      WHERE id = $1
      RETURNING id
    `,
      [id]
    );
  }
}
