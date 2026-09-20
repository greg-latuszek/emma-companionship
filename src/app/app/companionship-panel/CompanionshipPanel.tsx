'use client';

import { PageBackground } from '@/components/PageBackground';
import { AppArea } from '@/components/AppArea';
import { Navbar } from '@/components/Navbar';
import { LogoutButton } from '@/components/LogoutButton';
import { PageTitle } from '@/components/PageTitle';
import { motion, AnimatePresence } from 'motion/react';
import type { JSX } from 'react';
import type { SignedInMember } from './signed-in-member';

export function CompanionshipPanel({ member }: { member: SignedInMember }): JSX.Element {
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
                className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-8 text-gray-800"
              >
                <p className="text-gray-600 text-sm mb-2">Zalogowany użytkownik:</p>
                <p className="text-2xl font-bold mb-1">{member.name}</p>
                <p className="text-gray-500 mb-6">{member.email}</p>

                {member.memberId ? (
                  <div className="border-t pt-4 text-sm text-gray-600">
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
              <div className="bg-white rounded-lg shadow p-6 text-gray-800">
                <h3 className="text-lg font-bold mb-2">Companionship Relations</h3>
                <p className="text-gray-600 text-sm">
                  Manage your companionship relationships
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-gray-800">
                <h3 className="text-lg font-bold mb-2">Health Dashboard</h3>
                <p className="text-gray-600 text-sm">
                  View relationship health status
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-gray-800">
                <h3 className="text-lg font-bold mb-2">Settings</h3>
                <p className="text-gray-600 text-sm">
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
