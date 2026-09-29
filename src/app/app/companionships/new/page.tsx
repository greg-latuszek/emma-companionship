import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { CompanionshipRelationForm } from '../CompanionshipRelationForm';
import { submitNewCompanionshipRelation } from '../actions';

export default async function AddCompanionshipRelationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const member = await signedInMemberFrom(session);
  const members = await listCommunityMembers();

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
            <PageTitle delay={0.2}>Dodaj akompaniament</PageTitle>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full max-w-3xl p-6">
            <CompanionshipRelationForm
              action={submitNewCompanionshipRelation}
              members={members}
            />
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
