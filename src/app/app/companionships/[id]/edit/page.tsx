import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { listCouples } from '@/application/list-couples';
import { findCompanionshipRelation } from '@/application/find-companionship-relation';
import { findActiveCompanionshipRelationByAccompaniedId } from '@/application/find-active-companionship-relation-by-accompanied';
import { resolveCoupleCompanionshipEditContext } from '@/application/couple-companionship-edit-context';
import { currentTranslator } from '@/i18n/current-locale';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { CompanionshipRelationForm } from '../../CompanionshipRelationForm';
import { submitEditCompanionshipRelation } from '../../actions';
import type { CompanionshipRelationFormValues } from '../../companionship-relation-form-state';

export default async function EditCompanionshipRelationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const translate = await currentTranslator();

  if (!session?.user) {
    redirect('/');
  }

  const { id } = await params;
  const relation = await findCompanionshipRelation(id);

  if (!relation || relation.status !== 'active') {
    notFound();
  }

  const member = await signedInMemberFrom(session);
  const [members, couples] = await Promise.all([
    listCommunityMembers(),
    listCouples(),
  ]);

  const accompaniedCouple = couples.find(
    (couple) =>
      couple.husband.id === relation.accompanied_id ||
      couple.wife.id === relation.accompanied_id
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
    relation,
    couples,
    husbandActiveRelation,
    wifeActiveRelation
  );

  const accompanied = members.find(
    (candidate) => candidate.id === relation.accompanied_id
  );

  const initialValues: CompanionshipRelationFormValues = coupleEdit
    ? {
        accompanied_kind: 'couple',
        accompanied_id: coupleEdit.accompaniedCouple.id,
        companion_kind: 'couple',
        companion_id: coupleEdit.companionCoupleId ?? '',
        start_date: relation.start_date ?? '',
        end_date: relation.end_date ?? '',
        notes: relation.notes ?? '',
      }
    : {
        accompanied_kind: 'person',
        accompanied_id: relation.accompanied_id,
        companion_kind: 'person',
        companion_id: relation.companion_id,
        start_date: relation.start_date ?? '',
        end_date: relation.end_date ?? '',
        notes: relation.notes ?? '',
      };

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
            <PageTitle delay={0.2}>{translate('companionships.edit.title')}</PageTitle>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full max-w-3xl p-6">
            <CompanionshipRelationForm
              action={submitEditCompanionshipRelation.bind(
                null,
                id,
                relation.accompanied_id
              )}
              members={members}
              accompaniedCandidates={accompanied ? [accompanied] : []}
              accompaniedLocked={!coupleEdit}
              lockedCoupleEdit={
                coupleEdit
                  ? {
                      accompaniedCouple: coupleEdit.accompaniedCouple,
                      husbandRelationId: coupleEdit.husbandRelation.id,
                      wifeRelationId: coupleEdit.wifeRelation.id,
                    }
                  : undefined
              }
              couples={couples}
              initialValues={initialValues}
            />
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
