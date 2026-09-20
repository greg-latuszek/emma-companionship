import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function ContinueAfterSignInPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  if (session.user.is_active) {
    redirect('/app/companionship-panel');
  }

  redirect('/auth/awaiting-approval');
}
