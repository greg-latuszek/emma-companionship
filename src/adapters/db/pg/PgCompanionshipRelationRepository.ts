import { queryMany, queryOne } from '@/infrastructure/db/pg';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import type { CompanionshipRelationWriteWithDefaults } from '@/schemas/companionship-relation';
import { MemberId } from '@/types/auth';
import type {
  CompanionshipRelation,
  CompanionshipRelationListItem,
  CompanionshipRelationParticipant,
  CompanionshipRelationStatus,
  PersonWithoutCompanion,
} from '@/types/companionship-relation';

const COMPANIONSHIP_RELATION_COLUMNS = `
  cr.id,
  cr.status,
  cr.start_date::text,
  cr.end_date::text,
  cr.notes,
  companion.id AS companion_id,
  companion.first_name AS companion_first_name,
  companion.last_name AS companion_last_name,
  companion.marital_status AS companion_marital_status,
  companion.consecrated_status AS companion_consecrated_status,
  companion.community_engagement_status AS companion_community_engagement_status,
  accompanied.id AS accompanied_id,
  accompanied.first_name AS accompanied_first_name,
  accompanied.last_name AS accompanied_last_name,
  accompanied.marital_status AS accompanied_marital_status,
  accompanied.consecrated_status AS accompanied_consecrated_status,
  accompanied.community_engagement_status AS accompanied_community_engagement_status
`;

type CompanionshipRelationRow = {
  id: string;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  companion_id: string;
  companion_first_name: string;
  companion_last_name: string;
  companion_marital_status: string | null;
  companion_consecrated_status: string | null;
  companion_community_engagement_status: string | null;
  accompanied_id: string;
  accompanied_first_name: string;
  accompanied_last_name: string;
  accompanied_marital_status: string | null;
  accompanied_consecrated_status: string | null;
  accompanied_community_engagement_status: string | null;
};

function participantFromRow(
  id: string,
  first_name: string,
  last_name: string,
  marital_status: string | null,
  consecrated_status: string | null,
  community_engagement_status: string | null
): CompanionshipRelationParticipant {
  return {
    id: MemberId(id),
    first_name,
    last_name,
    marital_status: marital_status as CompanionshipRelationParticipant['marital_status'],
    consecrated_status: consecrated_status as CompanionshipRelationParticipant['consecrated_status'],
    community_engagement_status: community_engagement_status as CompanionshipRelationParticipant['community_engagement_status'],
  };
}

function companionshipRelationListItemFromRow(
  row: CompanionshipRelationRow
): CompanionshipRelationListItem {
  return {
    id: row.id,
    companion: participantFromRow(
      row.companion_id,
      row.companion_first_name,
      row.companion_last_name,
      row.companion_marital_status,
      row.companion_consecrated_status,
      row.companion_community_engagement_status
    ),
    accompanied: participantFromRow(
      row.accompanied_id,
      row.accompanied_first_name,
      row.accompanied_last_name,
      row.accompanied_marital_status,
      row.accompanied_consecrated_status,
      row.accompanied_community_engagement_status
    ),
    status: row.status,
    start_date: row.start_date,
    end_date: row.end_date,
    notes: row.notes,
  };
}

export class PgCompanionshipRelationRepository
  implements ICompanionshipRelationRepository
{
  async listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]> {
    const rows = await queryMany<CompanionshipRelationRow>(`
      SELECT ${COMPANIONSHIP_RELATION_COLUMNS}
      FROM companionship_relations cr
      JOIN members accompanied ON accompanied.id = cr.accompanied_id
      JOIN members companion ON companion.id = cr.companion_id
      ORDER BY accompanied.last_name, accompanied.first_name, cr.created_at
    `);
    return rows.map(companionshipRelationListItemFromRow);
  }

  async listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]> {
    const rows = await queryMany<{
      id: string;
      first_name: string;
      last_name: string;
      marital_status: string | null;
      consecrated_status: string | null;
      community_engagement_status: string | null;
    }>(`
      SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.marital_status,
        m.consecrated_status,
        m.community_engagement_status
      FROM members m
      WHERE m.community_engagement_status IS DISTINCT FROM 'Looker-On'
        AND NOT EXISTS (
          SELECT 1
          FROM companionship_relations cr
          WHERE cr.accompanied_id = m.id
        )
      ORDER BY m.last_name, m.first_name
    `);
    return rows.map((row) =>
      participantFromRow(
        row.id,
        row.first_name,
        row.last_name,
        row.marital_status,
        row.consecrated_status,
        row.community_engagement_status
      )
    );
  }

  async findCompanionshipRelationById(
    id: string
  ): Promise<CompanionshipRelation | null> {
    const row = await queryOne<{
      id: string;
      companion_id: string;
      accompanied_id: string;
      status: CompanionshipRelationStatus;
      start_date: string | null;
      end_date: string | null;
      notes: string | null;
    }>(
      `
      SELECT
        id,
        companion_id,
        accompanied_id,
        status,
        start_date::text,
        end_date::text,
        notes
      FROM companionship_relations
      WHERE id = $1
    `,
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      companion_id: MemberId(row.companion_id),
      accompanied_id: MemberId(row.accompanied_id),
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes,
    };
  }

  async addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    const row = await queryOne<{
      id: string;
      companion_id: string;
      accompanied_id: string;
      status: CompanionshipRelationStatus;
      start_date: string | null;
      end_date: string | null;
      notes: string | null;
    }>(`
      INSERT INTO companionship_relations (
        companion_id,
        accompanied_id,
        status,
        start_date,
        end_date,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        companion_id,
        accompanied_id,
        status,
        start_date::text,
        end_date::text,
        notes
    `, [
      write.companion_id,
      write.accompanied_id,
      write.status,
      write.start_date,
      write.end_date,
      write.notes,
    ]);

    if (!row) {
      throw new Error('Failed to insert companionship relation');
    }

    return {
      id: row.id,
      companion_id: MemberId(row.companion_id),
      accompanied_id: MemberId(row.accompanied_id),
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes,
    };
  }

  async updateCompanionshipRelation(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    const row = await queryOne<{
      id: string;
      companion_id: string;
      accompanied_id: string;
      status: CompanionshipRelationStatus;
      start_date: string | null;
      end_date: string | null;
      notes: string | null;
    }>(
      `
      UPDATE companionship_relations
      SET
        companion_id = $2,
        accompanied_id = $3,
        status = $4,
        start_date = $5,
        end_date = $6,
        notes = $7
      WHERE id = $1
      RETURNING
        id,
        companion_id,
        accompanied_id,
        status,
        start_date::text,
        end_date::text,
        notes
    `,
      [
        id,
        write.companion_id,
        write.accompanied_id,
        write.status,
        write.start_date,
        write.end_date,
        write.notes,
      ]
    );

    if (!row) {
      throw new Error('Failed to update companionship relation');
    }

    return {
      id: row.id,
      companion_id: MemberId(row.companion_id),
      accompanied_id: MemberId(row.accompanied_id),
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      notes: row.notes,
    };
  }

  async deleteCompanionshipRelation(id: string): Promise<void> {
    await queryOne(
      `
      DELETE FROM companionship_relations
      WHERE id = $1
      RETURNING id
    `,
      [id]
    );
  }
}
