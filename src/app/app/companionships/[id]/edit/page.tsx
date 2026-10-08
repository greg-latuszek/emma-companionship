import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { findCompanionshipRelation } from '@/application/find-companionship-relation';
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

  if (!session?.user) {
    redirect('/');
  }

  const { id } = await params;
  const relation = await findCompanionshipRelation(id);

  if (!relation) {
    notFound();
  }

  const member = await signedInMemberFrom(session);
  const members = await listCommunityMembers();

  const initialValues: CompanionshipRelationFormValues = {
    companion_id: relation.companion_id,
    accompanied_id: relation.accompanied_id,
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
            <PageTitle delay={0.2}>Edytuj akompaniament</PageTitle>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full max-w-3xl p-6">
            <CompanionshipRelationForm
              action={submitEditCompanionshipRelation.bind(null, id)}
              members={members}
              accompaniedCandidates={members}
              initialValues={initialValues}
            />
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
