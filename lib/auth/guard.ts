import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verifyJwt, type JwtPayload } from "./jwt";
import type { UserRole } from "./roles";

export class AuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string
  ) {
    super(message);
  }
}

export async function requireAuth(c: Context): Promise<JwtPayload> {
  const token = getCookie(c, "auth_token");
  if (!token) throw new AuthError(401, "Not authenticated");
  try {
    return await verifyJwt(token);
  } catch {
    throw new AuthError(401, "Invalid or expired session");
  }
}

export async function requireRole(
  c: Context,
  allowed: UserRole[]
): Promise<JwtPayload> {
  const user = await requireAuth(c);
  if (!allowed.includes(user.role)) {
    throw new AuthError(403, `Forbidden. Need: [${allowed.join(", ")}]`);
  }
  return user;
}
