import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCompanionLoads } from '@/application/list-companion-loads';
import { currentLocale } from '@/i18n/current-locale';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { CompanionshipPanel } from './CompanionshipPanel';
import { signedInMemberFrom } from './signed-in-member';

export default async function CompanionshipPanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const [member, missingPeople, companionLoads] = await Promise.all([
    signedInMemberFrom(session),
    listPeopleWithoutCompanion(),
    listCompanionLoads(await currentLocale()),
  ]);

  return (
    <CompanionshipPanel
      member={member}
      missingCount={missingPeople.length}
      overwhelmedCount={
        companionLoads.filter((companion) => companion.isOverwhelmed).length
      }
    />
  );
}
