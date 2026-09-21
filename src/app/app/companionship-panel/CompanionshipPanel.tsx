'use client';

import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import type { JSX } from 'react';
import type { SignedInMember } from './signed-in-member';
import { semiTransparentPanelClassName } from '@/components/SemiTransparentButton';
import { communityMembersPanelCard } from './community-members-panel-card';

export function CompanionshipPanel({ member }: { member: SignedInMember }): JSX.Element {
  const communityMembers = communityMembersPanelCard();

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

        <div className="flex flex-1 flex-col">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="pt-4 pb-16 px-4 text-center"
            >
              <PageTitle delay={0.2}>Witamy Delegata ds. Akompaniamentów</PageTitle>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`${semiTransparentPanelClassName} p-6 max-w-md mx-auto mt-8`}
              >
                <p className="mb-2 text-sm text-white/80">Zalogowany użytkownik:</p>
                <p className="mb-1 text-2xl font-bold">{member.name}</p>
                <p className="mb-6 text-white/70">{member.email}</p>

                {member.memberId ? (
                  <div className="border-t border-white/25 pt-4 text-sm text-white/80">
                    <p>ID: {member.memberId}</p>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="px-4 py-8 max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <Link
                href={communityMembers.href}
                className={`${semiTransparentPanelClassName} block p-6 hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                <h3 className="mb-2 text-lg font-bold">
                  {communityMembers.title}
                </h3>
                <p className="text-sm text-white/80">
                  Osoby wpisane do rejestru wspólnoty
                </p>
              </Link>

              <div className={`${semiTransparentPanelClassName} p-6`}>
                <h3 className="mb-2 text-lg font-bold">Health Dashboard</h3>
                <p className="text-sm text-white/80">
                  View relationship health status
                </p>
              </div>

              <div className={`${semiTransparentPanelClassName} p-6`}>
                <h3 className="mb-2 text-lg font-bold">Settings</h3>
                <p className="text-sm text-white/80">
                  Manage your account settings
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </AppArea>
    </PageBackground>
  );
}
