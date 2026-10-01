import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CompanionshipRelationList } from './CompanionshipRelationList';
import { CompanionshipsTabs } from './CompanionshipsTabs';
import { PeopleWithoutCompanionList } from './PeopleWithoutCompanionList';
import { companionshipsTabFrom } from './companionships-tab';

export default async function CompanionshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const member = await signedInMemberFrom(session);
  const selectedTab = companionshipsTabFrom((await searchParams).tab);

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
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/app/companionship-panel"
                className="inline-block text-white/80 underline-offset-4 hover:underline"
              >
                Wróć do panelu
              </Link>
            </div>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full min-w-0 max-w-3xl p-6 lg:max-w-none">
            <CompanionshipsTabs selectedTab={selectedTab} />
            {selectedTab === 'missing' ? (
              <PeopleWithoutCompanionList people={await listPeopleWithoutCompanion()} />
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <Link
                    href="/app/companionships/new"
                    className="rounded-lg bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
                  >
                    Dodaj akompaniament
                  </Link>
                </div>
                <CompanionshipRelationList relations={await listCompanionshipRelations()} />
              </>
            )}
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
