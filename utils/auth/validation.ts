export function validateUserId(id: string): boolean {
  return /^[a-zA-Z]{4}$/.test(id);
}

export function validatePassword(password: string): boolean {
  return password.length === 8;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateServiceCode(code: string): boolean {
  return /^[A-Z0-9]{2,10}$/.test(code);
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}
