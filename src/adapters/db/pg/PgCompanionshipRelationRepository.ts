import { queryMany } from '@/infrastructure/db/pg';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type {
  CompanionshipRelation,
  CompanionshipRelationStatus,
} from '@/types/companionship-relation';

const COMPANIONSHIP_RELATION_COLUMNS = `
  cr.id,
  cr.companion_id,
  cr.accompanied_id,
  cr.status,
  cr.start_date::text,
  cr.end_date::text,
  cr.notes
`;

type CompanionshipRelationRow = {
  id: string;
  companion_id: string;
  accompanied_id: string;
  status: CompanionshipRelationStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
};

function companionshipRelationFromRow(
  row: CompanionshipRelationRow
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

export class PgCompanionshipRelationRepository
  implements ICompanionshipRelationRepository
{
  async listCompanionshipRelations(): Promise<CompanionshipRelation[]> {
    const rows = await queryMany<CompanionshipRelationRow>(`
      SELECT ${COMPANIONSHIP_RELATION_COLUMNS}
      FROM companionship_relations cr
      JOIN members accompanied ON accompanied.id = cr.accompanied_id
      JOIN members companion ON companion.id = cr.companion_id
      ORDER BY accompanied.last_name, accompanied.first_name, cr.created_at
    `);
    return rows.map(companionshipRelationFromRow);
  }
}
