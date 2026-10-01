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
import { CommunityMemberForm } from './CommunityMemberForm';
import { submitNewCommunityMember } from './actions';

export default async function CommunityMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const [member, members] = await Promise.all([
    signedInMemberFrom(session),
    listCommunityMembers(),
  ]);

  const showForm = (await searchParams).tab === 'new';

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
                { href: '/app/members', label: 'Członkowie Wspólnoty', isActive: !showForm },
                { href: '/app/members?tab=new', label: '+ Dodaj Osobę', isActive: showForm },
              ]}
            >
              {showForm ? (
                <CommunityMemberForm action={submitNewCommunityMember} />
              ) : (
                <CommunityMemberList members={members} />
              )}
            </TabbedPanel>
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
