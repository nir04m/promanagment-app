import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

// Hashes a plain text password using bcrypt with 12 salt rounds
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compares a plain text password against a stored bcrypt hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validates password strength — minimum 8 chars, one uppercase, one number, one special char
export function isStrongPassword(password: string): boolean {
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return strongPasswordRegex.test(password);
}