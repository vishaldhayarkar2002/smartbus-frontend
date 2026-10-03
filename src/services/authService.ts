/** Mock auth service. Future: POST /api/auth/login, POST /api/auth/register (HttpOnly cookie session). */
import { mockFailure, mockRequest } from "@/services/api";
import { DEMO_CREDENTIALS } from "@/data/mockData";
import { nextId, readTable, writeTable } from "@/services/mockDb";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

const CREDENTIALS_KEY = "smartbus.db.credentials";

/** SHA-256 hex digest — mock only; a real server must use bcrypt/argon2. */
async function hashPassword(email: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function readCredentials(): Record<string, string> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CREDENTIALS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCredential(email: string, hash: string) {
  const all = readCredentials();
  all[email.toLowerCase()] = hash;
  window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(all));
}

function fakeToken(user: User) {
  return `mock.jwt.${user.id}.${crypto.randomUUID()}`;
}

const INVALID = "Invalid email or password. Try the demo credentials shown below.";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const email = payload.email.trim().toLowerCase();
  const demo = [DEMO_CREDENTIALS.user, DEMO_CREDENTIALS.admin].find((d) => d.email === email);
  let valid = demo ? demo.password === payload.password : false;
  if (!demo) {
    const stored = readCredentials()[email];
    valid = Boolean(stored) && stored === (await hashPassword(email, payload.password));
  }
  const user = readTable("users").find((u) => u.email.toLowerCase() === email);
  if (!valid || !user) return mockFailure(INVALID);
  if (user.status === "INACTIVE")
    return mockFailure("This account has been deactivated. Contact support.");
  return mockRequest({ token: fakeToken(user), user });
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const email = payload.email.trim().toLowerCase();
  const users = readTable("users");
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return mockFailure("An account with this email already exists.");
  }
  const user: User = {
    id: nextId(users),
    fullName: payload.fullName,
    email,
    mobile: payload.mobile,
    role: "USER",
    status: "ACTIVE",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  saveCredential(email, await hashPassword(email, payload.password));
  writeTable("users", [...users, user]);
  return mockRequest({ token: fakeToken(user), user });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  if (!email) return mockFailure("Please enter your registered email.");
  return mockRequest({ message: `A password reset link has been sent to ${email}.` });
}

export async function changePassword(
  current: string,
  next: string,
  email?: string,
): Promise<{ message: string }> {
  if (current === next) return mockFailure("New password must be different from the current one.");
  if (email) {
    const key = email.toLowerCase();
    const stored = readCredentials()[key];
    if (stored) {
      if (stored !== (await hashPassword(key, current))) {
        return mockFailure("Current password is incorrect.");
      }
      saveCredential(key, await hashPassword(key, next));
    }
  }
  return mockRequest({ message: "Password updated successfully." });
}

export async function updateProfile(user: User): Promise<User> {
  writeTable(
    "users",
    readTable("users").map((u) => (u.id === user.id ? user : u)),
  );
  return mockRequest(user);
}
