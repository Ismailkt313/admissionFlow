export function sanitizeString(val: string): string {
  if (!val) return '';
  return val.trim().replace(/\s+/g, ' ');
}

export function hasSecurityThreat(val: string): boolean {
  const trimmed = val.trim();
  if (/<script|javascript:|onclick|onerror|onload/i.test(trimmed)) return true;
  if (/<[^>]*>/i.test(trimmed)) return true;
  if (/\b(select\s+\*\s+from|drop\s+table|insert\s+into|delete\s+from|union\s+select)\b/i.test(trimmed)) return true;
  return false;
}

export function isValidName(name: string): boolean {
  if (!name) return false;
  if (hasSecurityThreat(name)) return false;
  const sanitized = sanitizeString(name);
  if (sanitized.length < 3 || sanitized.length > 50) return false;
  return /^[a-zA-Z\s]+$/.test(sanitized);
}

export function isValidStudentName(name: string): boolean {
  if (!name) return false;
  if (hasSecurityThreat(name)) return false;
  const sanitized = sanitizeString(name);
  if (sanitized.length < 3 || sanitized.length > 60) return false;
  return /^[a-zA-Z\s]+$/.test(sanitized);
}

export function getStudentAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function isValidDOB(dobDateInput: any): boolean {
  if (!dobDateInput) return false;
  const dobDate = new Date(dobDateInput);
  if (isNaN(dobDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dobOnly = new Date(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate());
  if (dobOnly >= today) return false;
  const age = getStudentAge(dobOnly);
  return age >= 3 && age <= 18;
}

export function isValidPreviousSchool(school: string): boolean {
  if (!school) return false;
  if (hasSecurityThreat(school)) return false;
  const sanitized = sanitizeString(school);
  if (sanitized.length < 3 || sanitized.length > 100) return false;
  if (/^[.\-\s]+$/.test(sanitized)) return false;
  return /^[a-zA-Z0-9\s.\-]+$/.test(sanitized);
}

export function isValidPassword(password: string): boolean {
  if (!password) return false;
  if (password.length < 8 || password.length > 64) return false;
  if (/\s/.test(password)) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}
