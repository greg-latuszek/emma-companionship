'use client';

import { DashboardNavbar } from '@/components/DashboardNavbar';
import { PageBackground } from '@/components/PageBackground';
import { motion, AnimatePresence } from 'motion/react';
import type { JSX } from 'react';

// Placeholder/mocked user data - will be replaced with real data in COMMIT 10
const mockUser = {
  name: 'Your Name',
  email: 'your.email@example.com',
  id: 'mock-user-id',
  createdAt: new Date(),
};

export default function CompanionshipPanelPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userEmail={mockUser.email} userName={mockUser.name} />

      <div className="relative">
        <PageBackground
          imageSource="/docs/img/Christ_and_st_Menas.webp"
          imageAlt="Background"
        />

        {/* Content */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative pt-32 pb-16 px-4 text-center"
          >
            <h1
              className="font-serif text-5xl md:text-6xl font-light mb-6 drop-shadow-lg"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px white',
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
              } as React.CSSProperties}
            >
              Witamy Delegata ds. Akompaniamentów
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto mt-12"
            >
              <p className="text-gray-600 text-sm mb-2">Zalogowany użytkownik:</p>
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {mockUser.name}
              </p>
              <p className="text-gray-500 mb-6">{mockUser.email}</p>

              <div className="border-t pt-4 text-sm text-gray-600">
                <p>ID: {mockUser.id}</p>
                <p>
                  Zarejestrowany:{' '}
                  {mockUser.createdAt.toLocaleDateString('pl-PL')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Content Area - Placeholder Cards */}
      <div className="px-4 py-16 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Companionship Relations</h3>
            <p className="text-gray-600 text-sm">
              Manage your companionship relationships
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Health Dashboard</h3>
            <p className="text-gray-600 text-sm">
              View relationship health status
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">Manage your account settings</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
