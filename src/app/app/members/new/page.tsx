import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CommunityMemberForm } from '../CommunityMemberForm';
import { submitNewCommunityMember } from '../actions';

export default async function AddCommunityMemberPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const member = await signedInMemberFrom(session);

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
            <PageTitle delay={0.2}>Dodaj osobę</PageTitle>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto mt-8 w-full text-gray-800">
            <CommunityMemberForm action={submitNewCommunityMember} />
          </div>
        </div>
      </AppArea>
    </PageBackground>
  );
}
