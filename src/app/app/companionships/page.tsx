import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCompanionshipRelations } from '@/application/list-companionship-relations';
import { listArchivedCompanionshipRelations } from '@/application/list-archived-companionship-relations';
import { groupArchivedCompanionshipHistory } from '@/application/group-archived-companionship-history';
import { groupPeopleWithoutCompanion } from '@/application/group-people-without-companion';
import { groupProposedCompanionshipChoices } from '@/application/group-proposed-companionship-choices';
import { listPeopleWithoutCompanion } from '@/application/list-people-without-companion';
import { listProposedCompanionshipRelationsForAccompanied } from '@/application/list-proposed-companionship-relations';
import { listCommunityMembers } from '@/application/list-community-members';
import { listCouples } from '@/application/list-couples';
import {
  findAccompaniedCompanionshipOption,
  proposeAccompaniedCompanionshipOptions,
} from '@/application/companionship-add-participant-options';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { TabbedPanel } from '@/components/TabbedPanel';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CompanionshipRelationList } from './CompanionshipRelationList';
import { CompanionshipRelationForm } from './CompanionshipRelationForm';
import { CompanionshipFindForm } from './CompanionshipFindForm';
import { PeopleWithoutCompanionList } from './PeopleWithoutCompanionList';
import { submitNewCompanionshipRelation } from './actions';
import { newCompanionshipFindFormValues } from './companionship-find-form-state';
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

  const needsCouples =
    selectedTab === 'new' ||
    selectedTab === 'find' ||
    selectedTab === 'history' ||
    selectedTab === 'missing';
  const needsPeopleWithoutCompanion =
    selectedTab === 'new' ||
    selectedTab === 'find' ||
    selectedTab === 'missing';
  const needsMembers = selectedTab === 'new' || selectedTab === 'find';

  const [member, members, peopleWithoutCompanion, couples, archivedRelations] =
    await Promise.all([
      signedInMemberFrom(session),
      needsMembers
        ? listCommunityMembers()
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof listCommunityMembers>>
          ),
      needsPeopleWithoutCompanion
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

  const missingRows =
    selectedTab === 'missing'
      ? groupPeopleWithoutCompanion(peopleWithoutCompanion, couples)
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

  const findFormValues =
    selectedTab === 'find'
      ? newCompanionshipFindFormValues(accompaniedId, accompaniedOptions)
      : undefined;

  const findAccompaniedOption =
    selectedTab === 'find' && findFormValues?.accompanied_id
      ? findAccompaniedCompanionshipOption(
          accompaniedOptions,
          findFormValues.accompanied_id
        )
      : undefined;

  const findAccompaniedCouple =
    findAccompaniedOption?.kind === 'couple'
      ? couples.find((couple) => couple.id === findAccompaniedOption.id)
      : undefined;

  const proposedRelations =
    selectedTab === 'find' && findAccompaniedOption
      ? await listProposedCompanionshipRelationsForAccompanied(
          findAccompaniedCouple
            ? [findAccompaniedCouple.husband.id, findAccompaniedCouple.wife.id]
            : [findAccompaniedOption.id]
        )
      : [];

  const proposalChoices =
    selectedTab === 'find'
      ? groupProposedCompanionshipChoices(proposedRelations, couples)
      : [];

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
                  href: companionshipsTabHref('find'),
                  label: companionshipsTabTitles.find,
                  isActive: selectedTab === 'find',
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
              ) : selectedTab === 'find' ? (
                <CompanionshipFindForm
                  members={members}
                  couples={couples}
                  accompaniedOptions={accompaniedOptions}
                  proposalChoices={proposalChoices}
                  initialValues={findFormValues!}
                />
              ) : selectedTab === 'missing' ? (
                <PeopleWithoutCompanionList rows={missingRows} />
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
