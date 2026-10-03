'use client';

import { motion } from 'motion/react';
import type { JSX } from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  delay?: number;
  strokeColor?: string;
  animated?: boolean;
}

/**
 * Reusable page title component with transparent text and white stroke effect
 * Used on both home page and companionship panel for consistent styling
 *
 * Default styling:
 * - Transparent text color
 * - White stroke outline (2px)
 * - Drop shadow filter for depth
 * - Responsive font sizes
 * - Optional motion animations
 *
 * @param children - Title text
 * @param delay - Animation delay (if animated=true)
 * @param strokeColor - Stroke color (default: "2px rgba(176, 205, 232, 0.4)")
 * @param animated - Enable motion animations (default: true)
 */
export function PageTitle({
  children,
  delay = 0.3,
  strokeColor = '2px rgba(176, 205, 232, 0.4)',
  animated = true,
}: PageTitleProps): JSX.Element {
  const baseClass =
    'font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] md:leading-[1.05] font-light tracking-tight drop-shadow-lg';

  const styleProps = {
    color: 'transparent',
    WebkitTextStroke: strokeColor,
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))',
  } as React.CSSProperties;

  if (animated) {
    return (
      <motion.h1
        className={baseClass}
        style={styleProps}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      >
        {children}
      </motion.h1>
    );
  }

  return <h1 className={baseClass} style={styleProps}>{children}</h1>;
}
