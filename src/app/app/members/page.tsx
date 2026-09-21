import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { CommunityMemberList } from './CommunityMemberList';

export default async function CommunityMembersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const member = signedInMemberFrom(session);
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

        <div className="flex flex-1 flex-col px-4 pb-16">
          <div className="pt-4 text-center">
            <PageTitle delay={0.2}>Członkowie wspólnoty</PageTitle>
            <Link
              href="/app/companionship-panel"
              className="inline-block text-white/80 underline-offset-4 hover:underline"
            >
              Wróć do panelu
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto mt-8 w-full text-gray-800">
            <CommunityMemberList members={members} />
          </div>
        </div>
      </AppArea>
    </PageBackground>
  );
}
