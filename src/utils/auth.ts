// src/utils/auth.ts
export const TOKEN_KEY = 'jwt';
export const USERNAME_KEY = 'auth_username';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setStoredUsername(username: string) {
  localStorage.setItem(USERNAME_KEY, username);
}
export function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

/** Merge this into axios headers when needed */
export function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
