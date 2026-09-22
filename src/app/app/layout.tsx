import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { decideWhereAnAppVisitorMustGo } from '@/lib/app-visit';
import { VisualStyleProvider } from '@/components/VisualStyleProvider';
import { signedInMemberFrom } from './companionship-panel/signed-in-member';

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const destination = decideWhereAnAppVisitorMustGo(session);

  if (destination || !session) {
    redirect(destination ?? '/');
  }

  const member = await signedInMemberFrom(session);

  return (
    <VisualStyleProvider visualStyle={member.visualStyle}>
      {children}
    </VisualStyleProvider>
  );
}
