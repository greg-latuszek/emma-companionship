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
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import { communityMembersPanelCard } from './community-members-panel-card';
import { companionshipsPanelCard } from './companionships-panel-card';
import { VisualStyleSettings } from './VisualStyleSettings';

export function CompanionshipPanel({
  member,
  missingCount,
}: {
  member: SignedInMember;
  missingCount: number;
}): JSX.Element {
  const communityMembers = communityMembersPanelCard();
  const companionships = companionshipsPanelCard(missingCount);
  const surfaces = visualSurfaces(useVisualStyle());

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
                className={`${surfaces.panel} block p-6 ${surfaces.panelHover} ${surfaces.focusOutline}`}
              >
                <h3 className="mb-2 text-lg font-bold">
                  {communityMembers.title}
                </h3>
                <p className={`text-sm ${surfaces.mutedText}`}>
                  Osoby wpisane do rejestru wspólnoty
                </p>
              </Link>

              <Link
                href={companionships.href}
                className={`${surfaces.panel} block p-6 ${surfaces.panelHover} ${surfaces.focusOutline}`}
              >
                <h3 className="mb-2 text-lg font-bold">
                  {companionships.title}
                </h3>
                <p className={`text-sm ${surfaces.mutedText}`}>
                  Kto jest czyim akompaniatorem
                </p>
                <p className={`mt-3 text-sm font-medium ${surfaces.strongText}`}>
                  Brakujące akompaniamenty: {companionships.missingCount}
                </p>
              </Link>

              <div className={`${surfaces.panel} p-6`}>
                {member.memberId ? (
                  <VisualStyleSettings />
                ) : (
                  <>
                    <h3 className="mb-2 text-lg font-bold">Ustawienia aplikacji</h3>
                    <p className={`text-sm ${surfaces.mutedText}`}>
                      Zaloguj się ponownie, aby zmienić wygląd.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </AppArea>
    </PageBackground>
  );
}
