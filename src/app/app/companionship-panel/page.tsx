import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { CompanionshipPanel } from './CompanionshipPanel';
import { signedInMemberFrom } from './signed-in-member';

export default async function CompanionshipPanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const [member, missingPeople] = await Promise.all([
    signedInMemberFrom(session),
    listPeopleWithoutCompanion(),
  ]);

  return <CompanionshipPanel member={member} missingCount={missingPeople.length} />;
}
