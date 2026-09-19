/**
 * Runtime validation for the Google OAuth profile Auth.js hands us.
 */

import { z } from 'zod';

export const oauthProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().nullable(),
});

export type OAuthProfile = z.infer<typeof oauthProfileSchema>;
