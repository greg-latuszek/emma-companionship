/**
 * Password Hashing & Verification
 * Using Argon2 for secure password hashing
 * Install: npm install argon2
 */

import argon2 from 'argon2';

/**
 * Hash a password using Argon2
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Previously hashed password
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Check if a hash needs rehashing (Argon2 parameters changed)
 * @param _hash - Password hash to check
 * @returns boolean - True if should be rehashed
 */
export function needsRehash(_hash: string): boolean {
  // Simple check: Argon2 hashes start with $argon2id$v=19$
  // If parameters in our config change, old hashes won't match
  // For now, return false - can be enhanced later
  return false;
}
