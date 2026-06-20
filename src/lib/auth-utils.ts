import { createClient } from "@/utils/supabase/server";
import type { AuthUser } from "@/types";

export async function getServerAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleRow?.role ?? "guest";

    return {
      userId: user.id,
      username: user.email ?? user.id,
      email: user.email ?? undefined,
      role,
      isAdmin: role === "admin",
      isBrideOrGroom: ["admin", "bride", "groom"].includes(role),
    };
  } catch {
    return null;
  }
}

export function requireAdminRole(user: AuthUser | null): void {
  if (!user?.isBrideOrGroom) throw new Error("Unauthorized");
}
