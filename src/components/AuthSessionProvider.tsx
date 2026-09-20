'use client';

import { SessionProvider } from 'next-auth/react';
import type { JSX, ReactNode } from 'react';

export function AuthSessionProvider({ children }: { children: ReactNode }): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
