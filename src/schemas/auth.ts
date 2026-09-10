/**
 * Zod Validation Schemas
 * Runtime validation for auth inputs and database models
 */

import { z } from 'zod';

// ===== Login & Authentication =====

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ===== Registration =====

export const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name required').max(255),
  lastName: z.string().min(2, 'Last name required').max(255),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Invalid phone number').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(255).optional(),
  authMethod: z.enum(['form', 'google', 'facebook']),
  oauth_provider: z.enum(['google', 'facebook']).optional(),
  oauth_id: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

// ===== OAuth Profile =====

export const oauthProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export type OAuthProfile = z.infer<typeof oauthProfileSchema>;

// ===== Blacklist =====

export const blacklistSchema = z
  .object({
    email: z.string().email().optional().nullable(),
    oauth_provider: z.enum(['google', 'facebook']).optional().nullable(),
    oauth_id: z.string().optional().nullable(),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
  })
  .refine(
    (data) => data.email || (data.oauth_provider && data.oauth_id),
    {
      message: 'Either email or both oauth_provider and oauth_id must be provided',
      path: ['email'],
    }
  );

export type BlacklistInput = z.infer<typeof blacklistSchema>;

// ===== Member Profile Update =====

export const memberProfileUpdateSchema = z.object({
  firstName: z.string().min(2).max(255).optional(),
  lastName: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(50).optional(),
  gender: z.enum(['male', 'female']).optional().nullable(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'consecrated']).optional().nullable(),
  dateOfBirth: z.string().date().optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  profilePicture: z.string().url().optional().nullable(),
});

export type MemberProfileUpdate = z.infer<typeof memberProfileUpdateSchema>;

// ===== Role Assignment =====

export const roleAssignmentSchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  role_id: z.string().uuid('Invalid role ID'),
  scope_id: z.string().uuid('Invalid scope ID').optional().nullable(),
});

export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;

// ===== Password Change =====

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(255),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

// ===== Password Reset Request =====

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

// ===== Password Reset Confirmation =====

export const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8).max(255),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

// ===== Role Matrix Validation =====

export const roleMatrixEntrySchema = z.object({
  name: z.enum(['Supervisor', 'Companionship Delegate', 'Admin']),
  level: z.enum(['sector', 'province', 'country', 'zone', 'international']),
  description: z.string().optional(),
});

export type RoleMatrixEntry = z.infer<typeof roleMatrixEntrySchema>;
