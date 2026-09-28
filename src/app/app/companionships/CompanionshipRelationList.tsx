import type { JSX } from 'react';
import type { CompanionshipRelationListItem } from '@/types/companionship-relation';

export function CompanionshipRelationList({
  relations,
}: {
  relations: CompanionshipRelationListItem[];
}): JSX.Element {
  if (relations.length === 0) {
    return (
      <p className="text-white/80 text-center">
        Nie ma jeszcze żadnych zapisanych akompaniamentów.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {relations.map((relation) => (
        <li
          key={relation.id}
          className="flex flex-col gap-1 rounded bg-white/10 px-4 py-3 text-white/90"
        >
          <div className="flex flex-wrap gap-x-2 font-medium">
            <span>
              {relation.accompanied.first_name} {relation.accompanied.last_name}
            </span>
            <span className="text-white/60">←</span>
            <span>
              {relation.companion.first_name} {relation.companion.last_name}
            </span>
          </div>
          {relation.start_date ? (
            <p className="text-sm text-white/60">
              Od {relation.start_date}
              {relation.status === 'archived' ? ' (zarchiwizowane)' : ''}
            </p>
          ) : (
            <p className="text-sm text-white/60">
              {relation.status === 'archived'
                ? 'Zarchiwizowane'
                : 'Data rozpoczęcia nieustalona'}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
