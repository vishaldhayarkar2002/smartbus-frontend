/** Mock auth service. Future: POST /api/auth/login, POST /api/auth/register */
import { mockFailure, mockRequest } from "@/services/api";
import { DEMO_CREDENTIALS, mockUsers } from "@/data/mockData";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

function fakeToken(user: User) {
  return `mock.jwt.${user.id}.${Date.now()}`;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  // return api.post<AuthResponse>("/auth/login", payload).then(r => r.data)
  const isDemoUser =
    payload.email === DEMO_CREDENTIALS.user.email && payload.password === DEMO_CREDENTIALS.user.password;
  const isDemoAdmin =
    payload.email === DEMO_CREDENTIALS.admin.email &&
    payload.password === DEMO_CREDENTIALS.admin.password;

  if (!isDemoUser && !isDemoAdmin) {
    return mockFailure("Invalid email or password. Try the demo credentials shown below.");
  }
  const user = mockUsers.find((u) => u.email === payload.email)!;
  return mockRequest({ token: fakeToken(user), user });
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  // return api.post<AuthResponse>("/auth/register", payload).then(r => r.data)
  if (mockUsers.some((u) => u.email === payload.email)) {
    return mockFailure("An account with this email already exists.");
  }
  const user: User = {
    id: Math.max(...mockUsers.map((u) => u.id)) + 1,
    fullName: payload.fullName,
    email: payload.email,
    mobile: payload.mobile,
    role: "USER",
    status: "ACTIVE",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  mockUsers.push(user);
  return mockRequest({ token: fakeToken(user), user });
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  // return api.post("/auth/forgot-password", { email }).then(r => r.data)
  if (!email) return mockFailure("Please enter your registered email.");
  return mockRequest({ message: `A password reset link has been sent to ${email}.` });
}

export async function changePassword(current: string, next: string): Promise<{ message: string }> {
  // return api.put("/users/me/password", { current, next }).then(r => r.data)
  if (current === next) return mockFailure("New password must be different from the current one.");
  return mockRequest({ message: "Password updated successfully." });
}

export async function updateProfile(user: User): Promise<User> {
  // return api.put<User>("/users/me", user).then(r => r.data)
  return mockRequest(user);
}
