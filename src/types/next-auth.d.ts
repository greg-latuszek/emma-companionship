import type { DefaultSession } from 'next-auth';
import type { MemberId } from '@/types/auth';

declare module 'next-auth' {
  interface Session {
    user: {
      memberId?: MemberId;
      is_active?: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    memberId?: MemberId;
    is_active?: boolean;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    memberId?: MemberId;
    is_active?: boolean;
  }
}
