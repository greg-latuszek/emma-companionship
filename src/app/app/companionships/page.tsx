import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { listArchivedCompanionshipRelations } from '@/application/list-archived-companionship-relations';
import { groupArchivedCompanionshipHistory } from '@/application/group-archived-companionship-history';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { listCommunityMembers } from '@/application/list-community-members';
import { listCouples } from '@/application/list-couples';
import { proposeAccompaniedCompanionshipOptions } from '@/application/companionship-add-participant-options';
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
import { newCompanionshipRelationFormValues } from './companionship-relation-form-state';
import {
  companionshipsTabFrom,
  companionshipsTabHref,
  companionshipsTabTitles,
} from './companionships-tab';

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

  const needsCouples = selectedTab === 'new' || selectedTab === 'history';

  const [member, members, peopleWithoutCompanion, couples, archivedRelations] =
    await Promise.all([
      signedInMemberFrom(session),
      selectedTab === 'new'
        ? listCommunityMembers()
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof listCommunityMembers>>
          ),
      selectedTab === 'new'
        ? listPeopleWithoutCompanion()
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof listPeopleWithoutCompanion>>
          ),
      needsCouples
        ? listCouples()
        : Promise.resolve([] as Awaited<ReturnType<typeof listCouples>>),
      selectedTab === 'history'
        ? listArchivedCompanionshipRelations()
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof listArchivedCompanionshipRelations>>
          ),
    ]);

  const historyRows =
    selectedTab === 'history'
      ? groupArchivedCompanionshipHistory(archivedRelations, couples)
      : [];

  const accompaniedOptions = proposeAccompaniedCompanionshipOptions(
    peopleWithoutCompanion,
    members,
    couples
  );

  const initialFormValues =
    selectedTab === 'new'
      ? newCompanionshipRelationFormValues(accompaniedId, accompaniedOptions)
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
                {
                  href: companionshipsTabHref('created'),
                  label: companionshipsTabTitles.created,
                  isActive: selectedTab === 'created',
                },
                {
                  href: companionshipsTabHref('missing'),
                  label: companionshipsTabTitles.missing,
                  isActive: selectedTab === 'missing',
                },
                {
                  href: companionshipsTabHref('history'),
                  label: companionshipsTabTitles.history,
                  isActive: selectedTab === 'history',
                },
                {
                  href: companionshipsTabHref('new'),
                  label: companionshipsTabTitles.new,
                  isActive: selectedTab === 'new',
                },
              ]}
            >
              {selectedTab === 'new' ? (
                <CompanionshipRelationForm
                  action={submitNewCompanionshipRelation}
                  members={members}
                  accompaniedOptions={accompaniedOptions}
                  couples={couples}
                  initialValues={initialFormValues!}
                  returnTab={returnTab}
                />
              ) : selectedTab === 'missing' ? (
                <PeopleWithoutCompanionList
                  people={await listPeopleWithoutCompanion()}
                />
              ) : selectedTab === 'history' ? (
                <CompanionshipRelationList historyRows={historyRows} readOnly />
              ) : (
                <CompanionshipRelationList
                  relations={await listCompanionshipRelations()}
                />
              )}
            </TabbedPanel>
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
