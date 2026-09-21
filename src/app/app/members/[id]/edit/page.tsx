import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { findCommunityMemberById } from '@/application/find-community-member';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { MemberId } from '@/types/auth';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { CommunityMemberForm } from '../../CommunityMemberForm';
import { RemoveCommunityMemberButton } from '../../RemoveCommunityMemberButton';
import { submitCommunityMemberEdits } from '../../actions';
import { communityMemberFormValuesFromMember } from '../../community-member-form-state';

export default async function EditCommunityMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { id } = await params;
  const person = await findCommunityMemberById(MemberId(id));

  if (!person) {
    notFound();
  }

  const member = await signedInMemberFrom(session);
  const saveEdits = submitCommunityMemberEdits.bind(null, person.id);

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

        <div className="flex flex-1 flex-col px-4 pb-16">
          <div className="pt-4 text-center">
            <PageTitle delay={0.2}>Edytuj osobę</PageTitle>
          </div>

          <SemiTransparentPanel className="p-6 max-w-3xl mx-auto mt-8 w-full">
            <CommunityMemberForm
              action={saveEdits}
              initialValues={communityMemberFormValuesFromMember(person)}
              loginHint={
                person.hasLoginIdentity
                  ? 'Ta osoba loguje się do aplikacji.'
                  : undefined
              }
            />
            {!person.hasLoginIdentity ? (
              <div className="mt-6 border-t border-white/25 pt-4">
                <RemoveCommunityMemberButton
                  memberId={person.id}
                  memberName={`${person.first_name} ${person.last_name}`}
                />
              </div>
            ) : null}
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
