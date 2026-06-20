/**
 * src/lib/auth-utils.ts
 *
 * Admin access is gated by an email allowlist (ADMIN_EMAILS env var),
 * not a database table — you only have a `guests` table, no user_roles.
 */

import { createClient } from "@/utils/supabase/server";
import type { AuthUser } from "@/types";

function getAdminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export async function getServerAuthUser(): Promise<AuthUser | null> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user || !user.email) return null;

        const isAdmin = getAdminEmails().includes(user.email.toLowerCase());

        return {
            userId: user.id,
            email: user.email,
            isAdmin,
        };
    } catch {
        return null;
    }
}

export function requireAdmin(user: AuthUser | null): void {
    if (!user?.isAdmin) throw new Error("Unauthorized");
}