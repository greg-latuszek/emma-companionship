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
import { findCompanionshipRelation } from '@/application/find-companionship-relation';
import { findActiveCompanionshipRelationByAccompaniedId } from '@/application/find-active-companionship-relation-by-accompanied';
import { resolveCoupleCompanionshipEditContext } from '@/application/couple-companionship-edit-context';
import {
  findAccompaniedCompanionshipOption,
  formatCompanionshipCoupleOptionLabel,
  formatCompanionshipPersonOptionLabel,
  proposeAccompaniedCompanionshipOptions,
  type CompanionshipParticipantOption,
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
import {
  submitActivateProposedCompanionshipFromFind,
  submitNewCompanionshipRelation,
} from './actions';
import {
  companionshipFindReturnHref,
  newCompanionshipFindFormValues,
} from './companionship-find-form-state';
import {
  fromFindCompanionshipRelationFormValues,
  newCompanionshipRelationFormValues,
  type CompanionshipParticipantKind,
} from './companionship-relation-form-state';
import {
  companionshipsTabFrom,
  companionshipsTabHref,
  companionshipsTabTitles,
} from './companionships-tab';

function participantKindFromParam(
  value: string | undefined
): CompanionshipParticipantKind | '' {
  if (value === 'person' || value === 'couple') {
    return value;
  }
  return '';
}

function companionshipParticipantLabel(
  kind: CompanionshipParticipantKind,
  id: string,
  members: Awaited<ReturnType<typeof listCommunityMembers>>,
  couples: Awaited<ReturnType<typeof listCouples>>
): string {
  if (kind === 'couple') {
    const couple = couples.find((candidate) => candidate.id === id);
    return couple ? formatCompanionshipCoupleOptionLabel(couple) : '—';
  }
  const member = members.find((candidate) => candidate.id === id);
  return member ? formatCompanionshipPersonOptionLabel(member) : '—';
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
  const changeRelationId = params.change?.toString();
  const fromFind = params.from?.toString() === 'find';
  const companionId = params.companion?.toString() ?? '';
  const accompaniedKindParam = participantKindFromParam(
    params.accompanied_kind?.toString()
  );
  const companionKindParam = participantKindFromParam(
    params.companion_kind?.toString()
  );
  const proposalId = params.proposal?.toString();
  const husbandProposalId = params.proposal_husband?.toString();
  const wifeProposalId = params.proposal_wife?.toString();

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

  let lockedFindAccompanied: CompanionshipParticipantOption | undefined;
  let currentCompanionLabel: string | undefined;
  if (selectedTab === 'find' && changeRelationId) {
    const openedRelation = await findCompanionshipRelation(changeRelationId);
    if (openedRelation && openedRelation.status === 'active') {
      const accompaniedCouple = couples.find(
        (couple) =>
          couple.husband.id === openedRelation.accompanied_id ||
          couple.wife.id === openedRelation.accompanied_id
      );
      const [husbandActiveRelation, wifeActiveRelation] = accompaniedCouple
        ? await Promise.all([
            findActiveCompanionshipRelationByAccompaniedId(
              accompaniedCouple.husband.id
            ),
            findActiveCompanionshipRelationByAccompaniedId(
              accompaniedCouple.wife.id
            ),
          ])
        : [null, null];
      const coupleEdit = resolveCoupleCompanionshipEditContext(
        openedRelation,
        couples,
        husbandActiveRelation,
        wifeActiveRelation
      );
      if (coupleEdit) {
        lockedFindAccompanied = {
          kind: 'couple',
          id: coupleEdit.accompaniedCouple.id,
          label: coupleEdit.accompaniedLabel,
        };
        if (coupleEdit.companionCoupleId) {
          currentCompanionLabel = companionshipParticipantLabel(
            'couple',
            coupleEdit.companionCoupleId,
            members,
            couples
          );
        } else {
          const husbandCompanion = members.find(
            (candidate) =>
              candidate.id === coupleEdit.husbandRelation.companion_id
          );
          const wifeCompanion = members.find(
            (candidate) => candidate.id === coupleEdit.wifeRelation.companion_id
          );
          if (husbandCompanion && wifeCompanion) {
            currentCompanionLabel = `${formatCompanionshipPersonOptionLabel(husbandCompanion)} + ${wifeCompanion.first_name}`;
          }
        }
      } else {
        const accompaniedMember = members.find(
          (candidate) => candidate.id === openedRelation.accompanied_id
        );
        if (accompaniedMember) {
          lockedFindAccompanied = {
            kind: 'person',
            id: accompaniedMember.id,
            label: formatCompanionshipPersonOptionLabel(accompaniedMember),
            gender: accompaniedMember.gender,
          };
        }
        currentCompanionLabel = companionshipParticipantLabel(
          'person',
          openedRelation.companion_id,
          members,
          couples
        );
      }
    }
  }

  const initialFormValues =
    selectedTab === 'new'
      ? fromFind &&
        accompaniedId &&
        companionId &&
        accompaniedKindParam &&
        companionKindParam
        ? fromFindCompanionshipRelationFormValues({
            accompaniedKind: accompaniedKindParam,
            accompaniedId,
            companionKind: companionKindParam,
            companionId,
          })
        : newCompanionshipRelationFormValues(accompaniedId, accompaniedOptions)
      : undefined;

  const lockedFromFind =
    selectedTab === 'new' &&
    fromFind &&
    accompaniedId &&
    companionId &&
    accompaniedKindParam &&
    companionKindParam
      ? {
          accompaniedKind: accompaniedKindParam,
          accompaniedId,
          accompaniedLabel: companionshipParticipantLabel(
            accompaniedKindParam,
            accompaniedId,
            members,
            couples
          ),
          companionKind: companionKindParam,
          companionId,
          companionLabel: companionshipParticipantLabel(
            companionKindParam,
            companionId,
            members,
            couples
          ),
          proposalId,
          husbandProposalId,
          wifeProposalId,
        }
      : undefined;

  const findFormValues =
    selectedTab === 'find'
      ? lockedFindAccompanied
        ? {
            accompanied_kind: lockedFindAccompanied.kind,
            accompanied_id: lockedFindAccompanied.id,
            companion_kind: '' as const,
            companion_id: '',
          }
        : newCompanionshipFindFormValues(accompaniedId, accompaniedOptions)
      : undefined;

  const findAccompaniedOption =
    selectedTab === 'find' && findFormValues?.accompanied_id
      ? (lockedFindAccompanied ??
        findAccompaniedCompanionshipOption(
          accompaniedOptions,
          findFormValues.accompanied_id
        ))
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

  const returnTab =
    fromFind || accompaniedId !== undefined ? 'missing' : undefined;
  const fromFindCancelHref =
    lockedFromFind !== undefined
      ? companionshipFindReturnHref({
          accompaniedId: lockedFromFind.accompaniedId,
          changeRelationId,
        })
      : undefined;

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
                  action={
                    lockedFromFind
                      ? submitActivateProposedCompanionshipFromFind
                      : submitNewCompanionshipRelation
                  }
                  members={members}
                  accompaniedOptions={accompaniedOptions}
                  couples={couples}
                  initialValues={initialFormValues!}
                  lockedFromFind={lockedFromFind}
                  returnTab={returnTab}
                  cancelHref={fromFindCancelHref}
                />
              ) : selectedTab === 'find' ? (
                <CompanionshipFindForm
                  members={members}
                  couples={couples}
                  accompaniedOptions={accompaniedOptions}
                  proposalChoices={proposalChoices}
                  initialValues={findFormValues!}
                  lockedAccompanied={lockedFindAccompanied}
                  changeRelationId={changeRelationId}
                  currentCompanionLabel={currentCompanionLabel}
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
