import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "./roles";

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET missing (min 32 chars)");
  return new TextEncoder().encode(s);
};

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti: string;
  iat?: number;
  exp?: number;
}

export const signJwt = (p: Omit<JwtPayload, "iat" | "exp">) =>
  new SignJWT({ ...p })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setJti(p.jti)
    .sign(secret());

export const verifyJwt = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as JwtPayload;
};
