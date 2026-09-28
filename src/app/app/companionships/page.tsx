import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CompanionshipRelationList } from './CompanionshipRelationList';

export default async function CompanionshipsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const member = await signedInMemberFrom(session);
  const relations = await listCompanionshipRelations();

  return (
    <PageBackground
      imageSource="/docs/img/Christ_and_st_Menas.webp"
      imageAlt="Background"
    >
      <AppArea>
        <Navbar
          rightContent={
            <LogoutButton
              profilePicture={member.profilePicture}
              email={member.email}
              delay={0.3}
            />
          }
        />

        <div className="flex min-w-0 flex-1 flex-col px-4 pb-16">
          <div className="pt-4 text-center">
            <PageTitle delay={0.2}>Akompaniamenty</PageTitle>
            <Link
              href="/app/companionship-panel"
              className="inline-block text-white/80 underline-offset-4 hover:underline"
            >
              Wróć do panelu
            </Link>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full min-w-0 max-w-3xl p-6">
            <CompanionshipRelationList relations={relations} />
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
