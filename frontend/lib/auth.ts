import Cookies from "js-cookie";
import { decodeJwt } from "jose";

const ACCESS_TOKEN_KEY = "ag_access";
const REFRESH_TOKEN_KEY = "ag_refresh";

export interface TokenPayload {
  sub: string; // user id
  email: string;
  role: "admin" | "farmer";
  full_name: string;
  exp: number;
}

export function saveTokens(access: string, refresh: string) {
  Cookies.set(ACCESS_TOKEN_KEY, access, { secure: true, sameSite: "lax" });
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { secure: true, sameSite: "lax", expires: 30 });
}

export function getAccessToken(): string | null {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

export function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return decodeJwt(token) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  // Check not expired
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}
