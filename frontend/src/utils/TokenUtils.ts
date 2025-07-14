// frontend/utils/TokenUtils.ts
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  exp: number; // UNIX timestamp
  [key: string]: any;
}

/**
 * Decodes a JWT access token and returns the payload.
 * @param token - JWT string
 * @returns decoded payload
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (err) {
    console.warn("Failed to decode token:", err);
    return null;
  }
}

/**
 * Checks whether the token is expired (with optional buffer).
 * @param token - JWT string
 * @param bufferSeconds - buffer time in seconds before actual expiry
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}

/**
 * Validates if token is present and not expired.
 * @param token - JWT string
 * @returns true if token is valid
 */
export function isTokenValid(token: string): boolean {
  return !isTokenExpired(token);
}
