/**
 * Validates JWT token structure and expiration timestamp.
 * Edge and Node.js compatible.
 */
export function isTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // Exp is in seconds, Date.now() is in milliseconds
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
}
