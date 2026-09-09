'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { JSX } from 'react';

interface DashboardNavbarProps {
  userEmail?: string;
  userName?: string;
}

export function DashboardNavbar({
  userEmail = 'your.email@example.com',
  userName = 'Your Name',
}: DashboardNavbarProps): JSX.Element {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-8 py-4 bg-white shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <Image
            src="/docs/img/logo_emmanuel_en-1.png"
            alt="emaCompanionship"
            fill
            className="object-contain"
            quality={90}
          />
        </div>
        <span className="text-xl font-serif font-light">emaCompanionship</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">{userName}</p>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
        >
          Wyloguj mnie
        </Link>
      </div>
    </motion.nav>
  );
}
