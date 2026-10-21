import {
  currentSqlRunner,
  runInOpenAtomicBlockOrOwnTransaction,
  type SqlPool,
} from '@/adapters/db/pg/PgCurrentClient';
import { withTransaction } from '@/infrastructure/db/pg';
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
import type { PoolClient } from 'pg';

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

type CompanionshipRelationInsertRow = {
  id: string;
  companion_id: string;
  accompanied_id: string;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

function companionshipRelationFromInsertRow(
  row: CompanionshipRelationInsertRow
): CompanionshipRelation {
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

async function insertCompanionshipRelationWithClient(
  client: PoolClient,
  write: CompanionshipRelationWriteWithDefaults
): Promise<CompanionshipRelation> {
  const result = await client.query<CompanionshipRelationInsertRow>(
    `
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
  `,
    [
      write.companion_id,
      write.accompanied_id,
      write.status,
      write.start_date,
      write.end_date,
      write.notes,
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error('Failed to insert companionship relation');
  }

  return companionshipRelationFromInsertRow(row);
}

export class PgCompanionshipRelationRepository
  implements ICompanionshipRelationRepository
{
  constructor(private readonly pool?: SqlPool) {}

  private async queryOne<T>(statement: string, values?: unknown[]): Promise<T | null> {
    const result = await currentSqlRunner(this.pool).query(statement, values);
    return (result.rows[0] as T | undefined) ?? null;
  }

  private async queryMany<T>(statement: string, values?: unknown[]): Promise<T[]> {
    const result = await currentSqlRunner(this.pool).query(statement, values);
    return result.rows as T[];
  }

  async listCompanionshipRelations(): Promise<CompanionshipRelationListItem[]> {
    const rows = await this.queryMany<CompanionshipRelationRow>(`
      SELECT ${COMPANIONSHIP_RELATION_COLUMNS}
      FROM companionship_relations cr
      JOIN members accompanied ON accompanied.id = cr.accompanied_id
      JOIN members companion ON companion.id = cr.companion_id
      WHERE cr.status = 'active'
      ORDER BY accompanied.last_name, accompanied.first_name, cr.created_at
    `);
    return rows.map(companionshipRelationListItemFromRow);
  }

  async listArchivedCompanionshipRelations(): Promise<
    CompanionshipRelationListItem[]
  > {
    const rows = await this.queryMany<CompanionshipRelationRow>(`
      SELECT ${COMPANIONSHIP_RELATION_COLUMNS}
      FROM companionship_relations cr
      JOIN members accompanied ON accompanied.id = cr.accompanied_id
      JOIN members companion ON companion.id = cr.companion_id
      WHERE cr.status = 'archived'
      ORDER BY cr.end_date DESC NULLS LAST,
        accompanied.last_name,
        accompanied.first_name,
        cr.created_at DESC
    `);
    return rows.map(companionshipRelationListItemFromRow);
  }

  async listProposedCompanionshipRelationsForAccompanied(
    accompaniedIds: string[]
  ): Promise<CompanionshipRelationListItem[]> {
    if (accompaniedIds.length === 0) {
      return [];
    }

    const rows = await this.queryMany<CompanionshipRelationRow>(
      `
      SELECT ${COMPANIONSHIP_RELATION_COLUMNS}
      FROM companionship_relations cr
      JOIN members accompanied ON accompanied.id = cr.accompanied_id
      JOIN members companion ON companion.id = cr.companion_id
      WHERE cr.status = 'proposed'
        AND cr.accompanied_id = ANY($1::uuid[])
      ORDER BY companion.last_name, companion.first_name, cr.created_at
    `,
      [accompaniedIds]
    );
    return rows.map(companionshipRelationListItemFromRow);
  }

  async listPeopleWithoutCompanion(): Promise<PersonWithoutCompanion[]> {
    const rows = await this.queryMany<{
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
            AND cr.status = 'active'
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
    const row = await this.queryOne<{
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

  async findActiveCompanionshipRelationByAccompaniedId(
    accompaniedId: string
  ): Promise<CompanionshipRelation | null> {
    const row = await this.queryOne<CompanionshipRelationInsertRow>(
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
      WHERE accompanied_id = $1
        AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [accompaniedId]
    );

    if (!row) {
      return null;
    }

    return companionshipRelationFromInsertRow(row);
  }

  async addCompanionshipRelation(
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    const row = await this.queryOne<CompanionshipRelationInsertRow>(
      `
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
    `,
      [
        write.companion_id,
        write.accompanied_id,
        write.status,
        write.start_date,
        write.end_date,
        write.notes,
      ]
    );

    if (!row) {
      throw new Error('Failed to insert companionship relation');
    }

    return companionshipRelationFromInsertRow(row);
  }

  async updateCompanionshipRelation(
    id: string,
    write: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    const row = await this.queryOne<{
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

  async updateCompanionshipRelationPair(
    husbandRelationId: string,
    wifeRelationId: string,
    husbandWrite: CompanionshipRelationWriteWithDefaults,
    wifeWrite: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]> {
    return withTransaction(async (client) => {
      const updates: [string, CompanionshipRelationWriteWithDefaults][] = [
        [husbandRelationId, husbandWrite],
        [wifeRelationId, wifeWrite],
      ];
      const results: CompanionshipRelation[] = [];
      for (const [relationId, write] of updates) {
        const result = await client.query<CompanionshipRelationInsertRow>(
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
            relationId,
            write.companion_id,
            write.accompanied_id,
            write.status,
            write.start_date,
            write.end_date,
            write.notes,
          ]
        );
        const row = result.rows[0];
        if (!row) {
          throw new Error('Failed to update companionship relation');
        }
        results.push(companionshipRelationFromInsertRow(row));
      }
      return [results[0]!, results[1]!];
    });
  }

  async archiveCompanionshipRelationAndAddReplacement(
    existingId: string,
    replacement: CompanionshipRelationWriteWithDefaults
  ): Promise<CompanionshipRelation> {
    const today = new Date().toISOString().slice(0, 10);
    return withTransaction(async (client) => {
      const archiveResult = await client.query(
        `
        UPDATE companionship_relations
        SET status = 'archived', end_date = $2
        WHERE id = $1
          AND status = 'active'
        RETURNING id
      `,
        [existingId, today]
      );
      if (!archiveResult.rows[0]) {
        throw new Error('Failed to archive companionship relation');
      }
      return insertCompanionshipRelationWithClient(client, {
        ...replacement,
        status: 'active',
      });
    });
  }

  async archiveCompanionshipRelationPairAndAddReplacement(
    husbandRelationId: string,
    wifeRelationId: string,
    husbandReplacement: CompanionshipRelationWriteWithDefaults,
    wifeReplacement: CompanionshipRelationWriteWithDefaults
  ): Promise<[CompanionshipRelation, CompanionshipRelation]> {
    const today = new Date().toISOString().slice(0, 10);
    return withTransaction(async (client) => {
      for (const relationId of [husbandRelationId, wifeRelationId]) {
        const archiveResult = await client.query(
          `
          UPDATE companionship_relations
          SET status = 'archived', end_date = $2
          WHERE id = $1
            AND status = 'active'
          RETURNING id
        `,
          [relationId, today]
        );
        if (!archiveResult.rows[0]) {
          throw new Error('Failed to archive companionship relation');
        }
      }
      const husbandRelation = await insertCompanionshipRelationWithClient(
        client,
        { ...husbandReplacement, status: 'active' }
      );
      const wifeRelation = await insertCompanionshipRelationWithClient(client, {
        ...wifeReplacement,
        status: 'active',
      });
      return [husbandRelation, wifeRelation];
    });
  }

  async archiveActiveCompanionshipRelation(id: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const row = await this.queryOne<{ id: string }>(
      `
      UPDATE companionship_relations
      SET status = 'archived', end_date = $2
      WHERE id = $1
        AND status = 'active'
      RETURNING id
    `,
      [id, today]
    );
    if (!row) {
      throw new Error('Failed to archive companionship relation');
    }
  }

  async deleteProposedCompanionshipRelation(id: string): Promise<void> {
    const row = await this.queryOne<{ id: string }>(
      `
      DELETE FROM companionship_relations
      WHERE id = $1
        AND status = 'proposed'
      RETURNING id
    `,
      [id]
    );
    if (!row) {
      throw new Error('Failed to delete proposed companionship relation');
    }
  }

  async deleteProposedCompanionshipRelationPair(
    husbandRelationId: string,
    wifeRelationId: string
  ): Promise<void> {
    await withTransaction(async (client) => {
      for (const relationId of [husbandRelationId, wifeRelationId]) {
        const result = await client.query(
          `
          DELETE FROM companionship_relations
          WHERE id = $1
            AND status = 'proposed'
          RETURNING id
        `,
          [relationId]
        );
        if (!result.rows[0]) {
          throw new Error('Failed to delete proposed companionship relation');
        }
      }
    });
  }

  async activateProposedCompanionshipRelation(
    proposedRelationId: string,
    activation: { start_date: string | null; notes: string | null }
  ): Promise<CompanionshipRelation> {
    const today = new Date().toISOString().slice(0, 10);
    return runInOpenAtomicBlockOrOwnTransaction(this.pool, async (client) => {
      const proposedResult = await client.query(
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
          AND status = 'proposed'
        FOR UPDATE
      `,
        [proposedRelationId]
      );
      const proposed = proposedResult.rows[0];
      if (!proposed) {
        throw new Error('Failed to find proposed companionship relation');
      }

      await client.query(
        `
        UPDATE companionship_relations
        SET status = 'archived', end_date = $2
        WHERE accompanied_id = $1
          AND status = 'active'
      `,
        [proposed.accompanied_id, today]
      );

      const activatedResult =
        await client.query(
          `
          UPDATE companionship_relations
          SET
            status = 'active',
            start_date = $2,
            end_date = NULL,
            notes = $3
          WHERE id = $1
            AND status = 'proposed'
          RETURNING
            id,
            companion_id,
            accompanied_id,
            status,
            start_date::text,
            end_date::text,
            notes
        `,
          [proposedRelationId, activation.start_date, activation.notes]
        );
      const activated = activatedResult.rows[0];
      if (!activated) {
        throw new Error('Failed to activate proposed companionship relation');
      }

      await client.query(
        `
        DELETE FROM companionship_relations
        WHERE accompanied_id = $1
          AND status = 'proposed'
          AND id <> $2
      `,
        [proposed.accompanied_id, proposedRelationId]
      );

      return companionshipRelationFromInsertRow(activated);
    });
  }

  async activateProposedCompanionshipRelationPair(
    husbandProposedRelationId: string,
    wifeProposedRelationId: string,
    activation: { start_date: string | null; notes: string | null }
  ): Promise<[CompanionshipRelation, CompanionshipRelation]> {
    const today = new Date().toISOString().slice(0, 10);
    return withTransaction(async (client) => {
      const proposedIds = [
        husbandProposedRelationId,
        wifeProposedRelationId,
      ];
      const proposedRows: CompanionshipRelationInsertRow[] = [];
      for (const relationId of proposedIds) {
        const proposedResult =
          await client.query<CompanionshipRelationInsertRow>(
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
              AND status = 'proposed'
            FOR UPDATE
          `,
            [relationId]
          );
        const proposed = proposedResult.rows[0];
        if (!proposed) {
          throw new Error('Failed to find proposed companionship relation');
        }
        proposedRows.push(proposed);
      }

      const accompaniedIds = proposedRows.map((row) => row.accompanied_id);
      await client.query(
        `
        UPDATE companionship_relations
        SET status = 'archived', end_date = $2
        WHERE accompanied_id = ANY($1::uuid[])
          AND status = 'active'
      `,
        [accompaniedIds, today]
      );

      const activated: CompanionshipRelation[] = [];
      for (const relationId of proposedIds) {
        const activatedResult =
          await client.query<CompanionshipRelationInsertRow>(
            `
            UPDATE companionship_relations
            SET
              status = 'active',
              start_date = $2,
              end_date = NULL,
              notes = $3
            WHERE id = $1
              AND status = 'proposed'
            RETURNING
              id,
              companion_id,
              accompanied_id,
              status,
              start_date::text,
              end_date::text,
              notes
          `,
            [relationId, activation.start_date, activation.notes]
          );
        const row = activatedResult.rows[0];
        if (!row) {
          throw new Error('Failed to activate proposed companionship relation');
        }
        activated.push(companionshipRelationFromInsertRow(row));
      }

      await client.query(
        `
        DELETE FROM companionship_relations
        WHERE accompanied_id = ANY($1::uuid[])
          AND status = 'proposed'
          AND id <> ALL($2::uuid[])
      `,
        [accompaniedIds, proposedIds]
      );

      return [activated[0]!, activated[1]!];
    });
  }

  async deleteCompanionshipRelation(id: string): Promise<void> {
    await this.queryOne(
      `
      DELETE FROM companionship_relations
      WHERE id = $1
      RETURNING id
    `,
      [id]
    );
  }
}
