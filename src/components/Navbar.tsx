'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import type { JSX } from 'react';

interface NavbarProps {
  /**
   * Content to render on the right side of the navbar
   * Can be LogoutButton, SemiTransparentButton, or any component
   */
  rightContent?: React.ReactNode;
  logoDelay?: number;
}

/**
 * Generic, composable navbar component
 * Renders logo on the left, with optional content on the right
 *
 * This navbar sits on top of the PageBackground and is reusable
 * across all pages (home, companionship panel, etc.)
 *
 * Example usage:
 *   <Navbar rightContent={<LogoutButton userName="John" userEmail="john@example.com" />} />
 *   <Navbar rightContent={<SemiTransparentButton href="/login">Sign In</SemiTransparentButton>} />
 *   <Navbar /> (logo only)
 */
export function Navbar({
  rightContent,
  logoDelay = 0,
}: NavbarProps): JSX.Element {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: logoDelay }}
      className="w-full px-6 sm:px-12 py-6 sm:py-8 flex items-center justify-between"
    >
      {/* Logo on the left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: logoDelay + 0.1 }}
        className="flex items-center"
      >
        <div className="relative w-60 h-60 sm:w-64 sm:h-24">
          <Image
            src="/docs/img/logo_emmanuel_en-1.png"
            alt="Emmanuel Community"
            fill
            className="object-contain"
            quality={90}
          />
        </div>
      </motion.div>

      {/* Right content (logout button, login button, etc.) */}
      {rightContent && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: logoDelay + 0.2 }}
        >
          {rightContent}
        </motion.div>
      )}
    </motion.nav>
  );
}
