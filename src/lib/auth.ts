import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Minimal signed-cookie sessions (no extra dependencies).
 * Each role has its own cookie, so admin and manager sessions are independent.
 * Token format: `<role>.<expiresAtUnix>.<hmacSha256>`
 *
 * Required env vars:
 *   AUTH_SECRET       – random string, at least 32 chars (e.g. `openssl rand -base64 48`)
 *   ADMIN_PASSWORD    – password for the admin login (/admin)
 *   MANAGER_PASSWORD  – password for the manager login (/manager/login)
 */

export type Role = "admin" | "manager";

const ROLE_CONFIG: Record<Role, { cookie: string; passwordEnv: string }> = {
  admin: { cookie: "kl_admin_session", passwordEnv: "ADMIN_PASSWORD" },
  manager: { cookie: "kl_manager_session", passwordEnv: "MANAGER_PASSWORD" },
};

export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

/** Constant-time string comparison (hashing first makes lengths equal). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function createSessionToken(role: Role): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${role}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(
  token: string | undefined,
  role: Role
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenRole, expStr, signature] = parts;
  if (tokenRole !== role) return false;

  let expected: string;
  try {
    expected = sign(`${tokenRole}.${expStr}`);
  } catch {
    return false; // AUTH_SECRET not configured -> nobody is authenticated
  }
  if (!safeEqual(signature, expected)) return false;

  const exp = Number(expStr);
  return Number.isFinite(exp) && exp >= Date.now() / 1000;
}

/** Whether the current request has a valid session for `role` (route handlers + server components). */
export async function hasRole(role: Role): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ROLE_CONFIG[role].cookie)?.value, role);
}

/** Returns a 401 response if the caller does not have `role`, otherwise null. */
export async function requireRole(role: Role): Promise<NextResponse | null> {
  if (!(await hasRole(role))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Returns a 401 response unless the caller has a valid session for at least
 * one of `roles` (each role's signed cookie is verified independently),
 * otherwise null.
 */
export async function requireAnyRole(roles: Role[]): Promise<NextResponse | null> {
  for (const role of roles) {
    if (await hasRole(role)) return null;
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

/** Shared POST handler for `/api/<role>/login`. Expects JSON `{ password }`. */
export async function handleLogin(
  request: Request,
  role: Role
): Promise<NextResponse> {
  const { cookie, passwordEnv } = ROLE_CONFIG[role];
  const expected = process.env[passwordEnv];
  const secret = process.env.AUTH_SECRET;
  if (!expected || !secret || secret.length < 32) {
    console.error(`${role} login: ${passwordEnv} / AUTH_SECRET not configured`);
    return NextResponse.json(
      { error: "Login is not configured on the server" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!password || !safeEqual(password, expected)) {
    // Small fixed delay to slow down password guessing
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, role });
  response.cookies.set(cookie, createSessionToken(role), cookieOptions(SESSION_MAX_AGE));
  return response;
}

/** Shared POST handler for `/api/<role>/logout`. */
export function handleLogout(role: Role): NextResponse {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ROLE_CONFIG[role].cookie, "", cookieOptions(0));
  return response;
}
