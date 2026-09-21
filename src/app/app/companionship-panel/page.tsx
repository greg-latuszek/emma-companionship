import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CompanionshipPanel } from './CompanionshipPanel';
import { signedInMemberFrom } from './signed-in-member';

export default async function CompanionshipPanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return <CompanionshipPanel member={await signedInMemberFrom(session)} />;
}
