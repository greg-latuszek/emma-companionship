/**
 * Identity an OAuth provider confirmed. Google, GitHub, etc. all map to this.
 */

import { z } from 'zod';

export const oauthIdentitySchema = z.object({
  provider: z.string().min(1),
  subject: z.string().min(1),
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  picture: z.string().url().optional().nullable(),
});

export type OAuthIdentity = z.infer<typeof oauthIdentitySchema>;
