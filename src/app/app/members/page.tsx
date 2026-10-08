import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { listCommunityMembers } from '@/application/list-community-members';
import { listCouples } from '@/application/list-couples';
import { listMarriedPeopleWithoutCouple } from '@/application/list-married-people-without-couple';
import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { signedInMemberFrom } from '@/app/app/companionship-panel/signed-in-member';
import { SemiTransparentPanel } from '@/components/SemiTransparentButton';
import { TabbedPanel } from '@/components/TabbedPanel';
import { CommunityMemberList } from './CommunityMemberList';
import { CommunityMemberForm } from './CommunityMemberForm';
import { CoupleBuilder } from './CoupleBuilder';
import { CoupleList } from './CoupleList';
import { submitNewCommunityMember } from './actions';
import {
  membersPageTabFrom,
  membersPageTabHref,
} from './members-page-tab';

export default async function CommunityMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const selectedTab = membersPageTabFrom((await searchParams).tab);

  const [member, members, couples, unpairedMarried] = await Promise.all([
    signedInMemberFrom(session),
    listCommunityMembers(),
    selectedTab === 'couples' ? listCouples() : Promise.resolve([]),
    selectedTab === 'build-couples'
      ? listMarriedPeopleWithoutCouple()
      : Promise.resolve([]),
  ]);

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
                {
                  href: membersPageTabHref('list'),
                  label: 'Członkowie Wspólnoty',
                  isActive: selectedTab === 'list',
                },
                {
                  href: membersPageTabHref('couples'),
                  label: 'Małżeństwa',
                  isActive: selectedTab === 'couples',
                },
                {
                  href: membersPageTabHref('build-couples'),
                  label: '+ Dodaj Małżeństwa',
                  isActive: selectedTab === 'build-couples',
                },
                {
                  href: membersPageTabHref('new'),
                  label: '+ Dodaj Osobę',
                  isActive: selectedTab === 'new',
                },
              ]}
            >
              {selectedTab === 'new' ? (
                <CommunityMemberForm action={submitNewCommunityMember} />
              ) : null}
              {selectedTab === 'list' ? (
                <CommunityMemberList members={members} />
              ) : null}
              {selectedTab === 'couples' ? (
                <CoupleList couples={couples} />
              ) : null}
              {selectedTab === 'build-couples' ? (
                <CoupleBuilder people={unpairedMarried} />
              ) : null}
            </TabbedPanel>
          </SemiTransparentPanel>
        </div>
      </AppArea>
    </PageBackground>
  );
}
