import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { listCommunityMembers } from '@/application/list-community-members';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { TabbedPanel } from '@/components/TabbedPanel';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CompanionshipRelationList } from './CompanionshipRelationList';
import { CompanionshipRelationForm } from './CompanionshipRelationForm';
import { PeopleWithoutCompanionList } from './PeopleWithoutCompanionList';
import { submitNewCompanionshipRelation } from './actions';
import {
  communityMembersNeedingCompanion,
  newCompanionshipRelationFormValues,
} from './companionship-relation-form-state';

function companionshipsTabFrom(tab: string | string[] | undefined): 'created' | 'missing' | 'new' {
  if (tab === 'missing') return 'missing';
  if (tab === 'new') return 'new';
  return 'created';
}

export default async function CompanionshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const params = await searchParams;
  const selectedTab = companionshipsTabFrom(params.tab);
  const accompaniedId = params.accompanied?.toString();

  const [member, members, peopleWithoutCompanion] = await Promise.all([
    signedInMemberFrom(session),
    selectedTab === 'new'
      ? listCommunityMembers()
      : Promise.resolve([] as Awaited<ReturnType<typeof listCommunityMembers>>),
    selectedTab === 'new'
      ? listPeopleWithoutCompanion()
      : Promise.resolve([] as Awaited<ReturnType<typeof listPeopleWithoutCompanion>>),
  ]);

  const accompaniedCandidates = communityMembersNeedingCompanion(
    members,
    peopleWithoutCompanion
  );

  const initialFormValues =
    selectedTab === 'new'
      ? newCompanionshipRelationFormValues(accompaniedId, accompaniedCandidates)
      : undefined;

  const returnTab = accompaniedId !== undefined ? 'missing' : undefined;

  return (
    <PageBackground
      imageSource="/docs/img/Christ_and_st_Menas.webp"
      imageAlt="Background"
    >
      <AppArea>
        <Navbar
          homeHref="/app/companionship-panel"
          rightContent={
            <LogoutButton
              profilePicture={member.profilePicture}
              email={member.email}
              delay={0.3}
            />
          }
        />

        <div className="flex min-w-0 flex-1 flex-col px-4 pb-16">
          <SemiTransparentPanel className="mx-auto mt-8 w-full min-w-0 max-w-3xl p-6 lg:max-w-none">
            <TabbedPanel
              ariaLabel="Akompaniamenty"
              tabs={[
                { href: '/app/companionships', label: 'Utworzone Akompaniamenty', isActive: selectedTab === 'created' },
                { href: '/app/companionships?tab=missing', label: 'Brakujące Akompaniamenty', isActive: selectedTab === 'missing' },
                { href: '/app/companionships?tab=new', label: '+ Dodaj Akompaniament', isActive: selectedTab === 'new' },
              ]}
            >
              {selectedTab === 'new' ? (
                <CompanionshipRelationForm
                  action={submitNewCompanionshipRelation}
                  members={members}
                  accompaniedCandidates={accompaniedCandidates}
                  initialValues={initialFormValues!}
                  returnTab={returnTab}
                />
              ) : selectedTab === 'missing' ? (
                <PeopleWithoutCompanionList people={await listPeopleWithoutCompanion()} />
              ) : (
                <CompanionshipRelationList relations={await listCompanionshipRelations()} />
              )}
            </TabbedPanel>
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
