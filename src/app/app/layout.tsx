import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { decideWhereAnAppVisitorMustGo } from '@/lib/app-visit';

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const destination = decideWhereAnAppVisitorMustGo(session);

  if (destination) {
    redirect(destination);
  }

  return children;
}
