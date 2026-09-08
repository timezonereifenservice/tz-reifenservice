import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isDashboardUserRole,
  mapUserRowToDashboardUser,
  type UserRow,
} from "@/lib/dashboard-users/profile";
import type {
  CreateDashboardUserInput,
  DashboardUser,
  DashboardUserRole,
} from "@/lib/dashboard-users/types";

const BCRYPT_ROUNDS = 12;
const USER_SELECT =
  "id, email, full_name, role, is_active, created_at, updated_at" as const;

export async function listUsers(): Promise<DashboardUser[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapUserRowToDashboardUser(row as Omit<UserRow, "password_hash">),
  );
}

export async function getUserById(id: string): Promise<DashboardUser | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select(USER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapUserRowToDashboardUser(data as Omit<UserRow, "password_hash">);
}

export async function getUserByEmail(
  email: string,
): Promise<(DashboardUser & { passwordHash: string }) | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, full_name, role, is_active, created_at, updated_at, password_hash",
    )
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as UserRow;
  return {
    ...mapUserRowToDashboardUser(row),
    passwordHash: row.password_hash,
  };
}

export async function createUser(
  input: CreateDashboardUserInput,
): Promise<DashboardUser> {
  if (!isDashboardUserRole(input.role)) {
    throw new Error("Invalid role.");
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!email || !name || password.length < 8) {
    throw new Error("Name, email, and password (min 8 chars) are required.");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      full_name: name,
      password_hash: passwordHash,
      role: input.role,
      is_active: true,
    })
    .select(USER_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not create user.");
  }

  return mapUserRowToDashboardUser(data as Omit<UserRow, "password_hash">);
}

export async function updateUser(
  id: string,
  patch: {
    name?: string;
    role?: string;
    password?: string;
    isActive?: boolean;
  },
): Promise<DashboardUser> {
  const updates: {
    full_name?: string;
    role?: DashboardUserRole;
    password_hash?: string;
    is_active?: boolean;
  } = {};

  if (typeof patch.name === "string" && patch.name.trim()) {
    updates.full_name = patch.name.trim();
  }

  if (typeof patch.role === "string") {
    if (!isDashboardUserRole(patch.role)) {
      throw new Error("Invalid role.");
    }
    updates.role = patch.role;
  }

  if (typeof patch.password === "string" && patch.password.length > 0) {
    if (patch.password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    updates.password_hash = await bcrypt.hash(patch.password, BCRYPT_ROUNDS);
  }

  if (typeof patch.isActive === "boolean") {
    updates.is_active = patch.isActive;
  }

  if (Object.keys(updates).length === 0) {
    const user = await getUserById(id);
    if (!user) throw new Error("User not found.");
    return user;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select(USER_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("User not found.");
  return mapUserRowToDashboardUser(data as Omit<UserRow, "password_hash">);
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error, count } = await supabase
    .from("users")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("User not found.");
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<
  | { ok: true; user: DashboardUser }
  | { ok: false; reason: "invalid" | "deactivated" }
> {
  const user = await getUserByEmail(email);
  if (!user) return { ok: false, reason: "invalid" };
  if (!user.isActive) return { ok: false, reason: "deactivated" };

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) return { ok: false, reason: "invalid" };

  return {
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  };
}
