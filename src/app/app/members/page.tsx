import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { CommunityMemberList } from './CommunityMemberList';
import { MembersTabs } from './MembersTabs';

export default async function CommunityMembersPage() {
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
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/app/companionship-panel"
                className="inline-block text-white/80 underline-offset-4 hover:underline"
              >
                Wróć do panelu
              </Link>
            </div>
          </div>

          <SemiTransparentPanel className="mx-auto mt-8 w-full min-w-0 max-w-3xl p-6 lg:max-w-none">
            <MembersTabs />
            <CommunityMemberList members={members} />
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
