"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Heart, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser } from "@/types";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/guests", label: "Guests", icon: Users },
];

export function AdminSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col border-r border-white/20 p-6"
      style={{ backgroundColor: "#1a1209" }}
    >
      <div className="flex items-center gap-2 mb-10">
        <Heart size={13} className="text-sand fill-sand" />
        <span className="font-serif text-lg font-light text-ivory">
          J <span className="italic">&amp;</span> D
        </span>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 list-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-sand/20 text-sand"
                      : "text-ivory/50 hover:text-ivory hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <p className="text-xs text-ivory/30 truncate">{user.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-ivory/40 hover:text-ivory transition-colors"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
