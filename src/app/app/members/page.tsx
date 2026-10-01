import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { TabbedPanel } from '@/components/TabbedPanel';
import { CommunityMemberList } from './CommunityMemberList';

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
              ariaLabel="Członkowie wspólnoty"
              tabs={[
                { href: '/app/members', label: 'Członkowie Wspólnoty', isActive: true },
                { href: '/app/members/new', label: '+ Dodaj Osobę' },
              ]}
            >
              <CommunityMemberList members={members} />
            </TabbedPanel>
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
