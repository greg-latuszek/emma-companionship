import { queryMany } from '@/infrastructure/db/pg';
import type { ICompanionshipRelationRepository } from '@/ports/repositories/ICompanionshipRelationRepository';
import { MemberId } from '@/types/auth';
import type {
  CompanionshipRelationListItem,
  CompanionshipRelationParticipant,
  CompanionshipRelationStatus,
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
  accompanied.id AS accompanied_id,
  accompanied.first_name AS accompanied_first_name,
  accompanied.last_name AS accompanied_last_name
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
  accompanied_id: string;
  accompanied_first_name: string;
  accompanied_last_name: string;
};

function participantFromRow(
  id: string,
  first_name: string,
  last_name: string
): CompanionshipRelationParticipant {
  return {
    id: MemberId(id),
    first_name,
    last_name,
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
      row.companion_last_name
    ),
    accompanied: participantFromRow(
      row.accompanied_id,
      row.accompanied_first_name,
      row.accompanied_last_name
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
}
