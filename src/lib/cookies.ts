/**
 * Client-side cookie utility for reading/writing cookies via document.cookie.
 *
 * We intentionally avoid httpOnly so that client components ("use client")
 * can both read and write these preference cookies. They contain no
 * sensitive data — only UI preferences like onboarding status, timer state,
 * and alarm settings.
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export interface CookieOptions {
  maxAge?: number; // seconds
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
}

/**
 * Get a cookie value by name. Returns null if not found or not in browser.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/**
 * Set a cookie. Defaults to 1-year expiry, path "/", SameSite=Lax.
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") return;

  const {
    maxAge = DEFAULT_MAX_AGE,
    path = "/",
    sameSite = "lax",
    secure = false,
  } = options;

  let cookieStr = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;
  if (secure) {
    cookieStr += "; Secure";
  }

  document.cookie = cookieStr;
}

/**
 * Delete a cookie by setting its max-age to 0.
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=${path}; max-age=0`;
}
