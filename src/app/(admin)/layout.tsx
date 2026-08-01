"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users, CheckCircle2, XCircle, Clock, Mail, RefreshCw, Search } from "lucide-react";

// Same palette as the rest of the site.
const NAVY = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const GREENERY = "#7FAA6E";

type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    selectedWedding: "Colombia" | "USA" | "Both" | null;
    stdResponded?: boolean;
    stdAttendingColombia?: boolean;
    stdAttendingFlorida?: boolean;
    plusOneCount?: number | null;
    confirmationEmailSent?: boolean;
    role?: string | null;
    invitationType?: string | null;
};

function isAdmin(guest: any) {
    // TODO: adjust to however admin-ness is actually flagged in your schema —
    // this assumes you already return an isAdmin/role field on login, or you
    // can swap this for an ADMIN_EMAILS check against guest.email.
    return guest?.isAdmin === true || guest?.role === "admin";
}

type Tab = "overview" | "guests";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [guest, setGuest] = useState<any>(null);
    const [authorized, setAuthorized] = useState<"checking" | "yes" | "no">("checking");
    const [tab, setTab] = useState<Tab>("overview");
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [resending, setResending] = useState<string | null>(null);
    const [resendingAll, setResendingAll] = useState(false);
    const [toast, setToast] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (!stored) {
            setAuthorized("no");
            return;
        }
        try {
            const parsed = JSON.parse(stored);
            setGuest(parsed);
            setAuthorized(isAdmin(parsed) ? "yes" : "no");
        } catch {
            setAuthorized("no");
        }
    }, []);

    useEffect(() => {
        if (authorized !== "yes") return;
        loadGuests();
    }, [authorized]);

    async function loadGuests() {
        setLoading(true);
        try {
            // TODO: point this at whatever endpoint returns your full guest
            // list — e.g. an existing /api/admin/guests route. Adjust the
            // field mapping below to match your actual API response shape.
            const res = await fetch("/api/admin/guests", {
                headers: { "x-admin-email": guest?.email ?? "" },
            });
            const json = await res.json();
            setGuests(json.guests ?? []);
        } catch (err) {
            console.error("Failed to load guests:", err);
        } finally {
            setLoading(false);
        }
    }

    async function resendOne(guestId: string) {
        setResending(guestId);
        try {
            const res = await fetch("/api/admin/resend-confirmations", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-email": guest?.email ?? "" },
                body: JSON.stringify({ guestId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Resend failed");
            setToast("Confirmation email resent.");
            await loadGuests();
        } catch (err: any) {
            setToast(err.message ?? "Something went wrong.");
        } finally {
            setResending(null);
            setTimeout(() => setToast(""), 3000);
        }
    }

    async function resendAllPending() {
        setResendingAll(true);
        try {
            const res = await fetch("/api/admin/resend-confirmations", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-email": guest?.email ?? "" },
                body: JSON.stringify({ all: true }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Resend failed");
            setToast(`Sent ${json.sent ?? 0} confirmation emails.`);
            await loadGuests();
        } catch (err: any) {
            setToast(err.message ?? "Something went wrong.");
        } finally {
            setResendingAll(false);
            setTimeout(() => setToast(""), 3000);
        }
    }

    const stats = useMemo(() => {
        const total = guests.length;
        const responded = guests.filter((g) => g.stdResponded).length;
        const pending = total - responded;
        const attendingColombia = guests.filter((g) => g.stdAttendingColombia).length;
        const attendingUsa = guests.filter((g) => g.stdAttendingFlorida).length;
        const declined = guests.filter((g) => g.stdResponded && !g.stdAttendingColombia && !g.stdAttendingFlorida).length;
        const headcountColombia = guests
            .filter((g) => g.stdAttendingColombia)
            .reduce((sum, g) => sum + (g.plusOneCount ?? 1), 0);
        const headcountUsa = guests
            .filter((g) => g.stdAttendingFlorida)
            .reduce((sum, g) => sum + (g.plusOneCount ?? 1), 0);
        const emailsPending = guests.filter(
            (g) => (g.stdAttendingColombia || g.stdAttendingFlorida) && !g.confirmationEmailSent
        ).length;

        return { total, responded, pending, attendingColombia, attendingUsa, declined, headcountColombia, headcountUsa, emailsPending };
    }, [guests]);

    const filteredGuests = useMemo(() => {
        if (!search.trim()) return guests;
        const q = search.trim().toLowerCase();
        return guests.filter(
            (g) =>
                `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
                g.email?.toLowerCase().includes(q)
        );
    }, [guests, search]);

    if (authorized === "checking") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                <Loader2 size={24} className="animate-spin" style={{ color: APRICOT }} />
            </div>
        );
    }

    if (authorized === "no") {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <div className="rounded-2xl p-8 text-center max-w-sm" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                    <p className="text-sm" style={{ color: `${NAVY}99` }}>
                        This page is only for Jhoana and Damariel.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-5 px-7 py-3 rounded-full text-xs uppercase tracking-[0.15em]"
                        style={{ backgroundColor: APRICOT, color: "#fff" }}
                    >
                        Back to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-4xl mx-auto px-5 pt-14 pb-20">
                <div className="mb-8">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] mb-2" style={{ color: APRICOT }}>
                        Private
                    </p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.3rem", fontWeight: 300, color: NAVY }}>
                        Wedding Dashboard
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-7">
                    {(["overview", "guests"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] transition-all"
                            style={{
                                backgroundColor: tab === t ? NAVY : "#fff",
                                color: tab === t ? IVORY : NAVY,
                                border: `1px solid ${tab === t ? NAVY : SAND}`,
                            }}
                        >
                            {t === "overview" ? "Overview" : "Guest List"}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={22} className="animate-spin" style={{ color: APRICOT }} />
                    </div>
                ) : tab === "overview" ? (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <StatCard icon={<Users size={16} />} label="Total Guests" value={stats.total} color={NAVY} />
                            <StatCard icon={<CheckCircle2 size={16} />} label="Responded" value={stats.responded} color={GREENERY} />
                            <StatCard icon={<Clock size={16} />} label="Awaiting Response" value={stats.pending} color={APRICOT} />
                            <StatCard icon={<Users size={16} />} label="Colombia — Attending" value={`${stats.attendingColombia} (${stats.headcountColombia} incl. +1s)`} color={SKY} />
                            <StatCard icon={<Users size={16} />} label="Gainesville — Attending" value={`${stats.attendingUsa} (${stats.headcountUsa} incl. +1s)`} color={APRICOT} />
                            <StatCard icon={<XCircle size={16} />} label="Declined" value={stats.declined} color="#8a9aa5" />
                        </div>

                        {stats.emailsPending > 0 && (
                            <div
                                className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                                style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}44` }}
                            >
                                <div className="flex items-center gap-3">
                                    <Mail size={18} style={{ color: APRICOT }} />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: NAVY }}>
                                            {stats.emailsPending} guest{stats.emailsPending === 1 ? "" : "s"} attending without a confirmation email
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}70` }}>
                                            Usually means they RSVP'd before email was fully configured.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={resendAllPending}
                                    disabled={resendingAll}
                                    className="px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] flex items-center gap-2 disabled:opacity-50"
                                    style={{ backgroundColor: NAVY, color: IVORY }}
                                >
                                    {resendingAll ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                    Send All Now
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="relative mb-4">
                            <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: `${NAVY}60` }} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: "#fff", border: `1px solid ${SAND}`, color: NAVY }}
                            />
                        </div>

                        <div className="space-y-2">
                            {filteredGuests.map((g) => {
                                const attending = g.stdAttendingColombia || g.stdAttendingFlorida;
                                const weddingLabel = [
                                    g.stdAttendingColombia ? "Colombia" : null,
                                    g.stdAttendingFlorida ? "Gainesville" : null,
                                ]
                                    .filter(Boolean)
                                    .join(" + ");

                                return (
                                    <div
                                        key={g.id}
                                        className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
                                        style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
                                    >
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                                {g.firstName} {g.lastName}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>
                                                {g.email || "No email on file"}
                                                {" · "}
                                                {!g.stdResponded
                                                    ? "Not responded yet"
                                                    : attending
                                                        ? `Attending: ${weddingLabel}`
                                                        : "Declined"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {g.stdResponded && attending && (
                                                <span
                                                    className="text-[0.65rem] px-2.5 py-1 rounded-full"
                                                    style={{
                                                        backgroundColor: g.confirmationEmailSent ? `${GREENERY}20` : `${APRICOT}20`,
                                                        color: g.confirmationEmailSent ? GREENERY : APRICOT,
                                                    }}
                                                >
                                                    {g.confirmationEmailSent ? "Email sent" : "Email pending"}
                                                </span>
                                            )}
                                            {g.stdResponded && attending && !g.confirmationEmailSent && g.email && (
                                                <button
                                                    onClick={() => resendOne(g.id)}
                                                    disabled={resending === g.id}
                                                    className="px-4 py-2 rounded-full text-[0.65rem] uppercase tracking-[0.1em] flex items-center gap-1.5 disabled:opacity-50"
                                                    style={{ backgroundColor: SAND_LIGHT, color: NAVY }}
                                                >
                                                    {resending === g.id ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                                                    Resend
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredGuests.length === 0 && (
                                <p className="text-sm text-center py-10" style={{ color: `${NAVY}55` }}>
                                    No guests match your search.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {toast && (
                    <div
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-xs"
                        style={{ backgroundColor: NAVY, color: IVORY }}
                    >
                        {toast}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
            <div className="flex items-center gap-2 mb-2" style={{ color }}>
                {icon}
                <p className="text-[0.6rem] uppercase tracking-[0.12em]" style={{ color: `${NAVY}70` }}>
                    {label}
                </p>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 400, color: NAVY }}>
                {value}
            </p>
        </div>
    );
}