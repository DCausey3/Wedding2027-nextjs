"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut } from "lucide-react";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleSignOut = () => {
        sessionStorage.removeItem("guest");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#2c3e4a]">
            {/* Admin Top Navigation */}
            <header className="border-b border-[#E6D2B3]/40 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-[#FFB482] fill-[#FFB482]" />
                        <span className="font-serif text-lg tracking-wide">
              J &amp; D Admin
            </span>
                    </div>

                    <nav className="flex items-center gap-6 text-xs uppercase tracking-widest">
                        <Link href="/src/app/(public)/admin/dashboard" className="hover:text-[#FFB482] transition-colors">
                            Dashboard
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Page Content Container */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}