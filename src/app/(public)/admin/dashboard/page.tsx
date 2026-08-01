"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Loader2,
    ShieldAlert,
    Search,
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    Mail,
    Phone,
    Plane,
    MapPin,
    Users,
    X,
    BookmarkCheck
} from "lucide-react";
import { getDashboardStats, getAllGuests, updateGuest } from "@/lib/data-client";
import { DashboardStats } from "@/components/admin/DashboardStats";

const COLORS = {
    navy: '#2c3e4a',
    skyBlue: '#A4D4F4',
    apricot: '#FFB482',
    ivory: '#FFF7EC',
    sand: '#E6D2B3',
    sandLight: '#F2E8D5',
    muted: '#8a9aa5',
    greenery: '#7FAA6E',
    error: '#d4183d',
};

const EMPTY_STATS = {
    totalInvited: 0,
    accepted: 0,
    declined: 0,
    pending: 0,
    colombiaCount: 0,
    usaCount: 0,
    bothCount: 0,
    plusOneCount: 0,
};

export default function DashboardPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState<"loading" | "yes" | "no">("loading");
    const [stats, setStats] = useState<any>(EMPTY_STATS);
    const [guests, setGuests] = useState<any[]>([]);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "accepted" | "declined" | "pending">("all");
    const [stdFilter, setStdFilter] = useState<"all" | "std_done" | "std_pending">("all");
    const [eventFilter, setEventFilter] = useState<"all" | "colombia" | "florida">("all");
    const [viewMode, setViewMode] = useState<"all" | "recent">("all");

    // Quick Add Guest Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGuest, setNewGuest] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        invitationCode: "",
        role: "Guest",
        eligibleColombia: true,
        plusOneAllowed: false,
    });
    const [savingGuest, setSavingGuest] = useState(false);

    useEffect(() => {
        async function verifyAndLoadData() {
            try {
                const storedGuestStr = sessionStorage.getItem("guest");
                if (!storedGuestStr) {
                    setAuthorized("no");
                    return;
                }

                const storedGuest = JSON.parse(storedGuestStr);
                const isAdmin = storedGuest?.role === "Bride" || storedGuest?.role === "Groom";
                if (!isAdmin) {
                    setAuthorized("no");
                    return;
                }

                setAuthorized("yes");

                const [statsData, guestsData] = await Promise.all([
                    getDashboardStats(),
                    getAllGuests(),
                ]);

                setStats(statsData ?? EMPTY_STATS);
                setGuests(guestsData ?? []);
            } catch (err) {
                console.error("[Admin Dashboard] Error loading data:", err);
                setAuthorized("no");
            }
        }

        verifyAndLoadData();
    }, []);

    // Filtered Guests Logic
    const filteredGuests = useMemo(() => {
        return guests.filter((guest) => {
            // 1. Search Query Match
            const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase();
            const code = (guest.invitationCode || "").toLowerCase();
            const email = (guest.email || "").toLowerCase();
            const matchesSearch =
                fullName.includes(searchTerm.toLowerCase()) ||
                code.includes(searchTerm.toLowerCase()) ||
                email.includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // 2. RSVP Status Filter
            if (statusFilter === "accepted") {
                if (!guest.rsvpResponded || (!guest.attendingColombia && !guest.attendingFlorida)) return false;
            } else if (statusFilter === "declined") {
                if (!guest.rsvpResponded || guest.attendingColombia || guest.attendingFlorida) return false;
            } else if (statusFilter === "pending") {
                if (guest.rsvpResponded) return false;
            }

            // 3. Save The Date (STD) Filter
            if (stdFilter === "std_done" && !guest.stdResponded) return false;
            if (stdFilter === "std_pending" && guest.stdResponded) return false;

            // 4. Event Filter (Final RSVP or STD intention)
            if (eventFilter === "colombia" && !guest.attendingColombia && !guest.stdAttendingColombia) return false;
            if (eventFilter === "florida" && !guest.attendingFlorida && !guest.stdAttendingFlorida) return false;

            return true;
        });
    }, [guests, searchTerm, statusFilter, stdFilter, eventFilter]);

    const displayedGuests = viewMode === "recent" ? filteredGuests.slice(0, 10) : filteredGuests;

    if (authorized === "loading") {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: COLORS.sand }} />
                <p className="text-xs uppercase tracking-widest text-muted font-sans">
                    Verifying credentials...
                </p>
            </div>
        );
    }

    if (authorized === "no") {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <div className="p-4 rounded-full bg-red-50 mb-4">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-serif text-2xl text-dark mb-2">Access Restricted</h2>
                <p className="text-sm text-muted max-w-sm mb-6">
                    This portal is reserved for Bride &amp; Groom admin access only.
                </p>
                <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2.5 rounded-full text-xs uppercase tracking-widest bg-navy text-ivory hover:opacity-90 transition-opacity"
                >
                    Return to Guest Login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="uppercase tracking-widest text-xs font-semibold mb-1" style={{ color: COLORS.apricot }}>
                        Bride &amp; Groom Control Center
                    </p>
                    <h1 className="font-serif text-4xl font-light" style={{ color: COLORS.navy }}>
                        Guest Management
                    </h1>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-medium transition-all shadow-sm hover:opacity-95"
                    style={{ backgroundColor: COLORS.navy, color: COLORS.ivory }}
                >
                    <UserPlus size={16} />
                    Add New Guest
                </button>
            </div>

            {/* Top Level Key Statistics */}
            <DashboardStats stats={stats} />

            {/* Filter & Control Bar */}
            <div className="p-6 rounded-2xl border shadow-sm space-y-4" style={{ backgroundColor: '#ffffff', borderColor: COLORS.sandLight }}>
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

                    {/* Search Box */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.muted }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{ backgroundColor: COLORS.sandLight, border: '1px solid transparent', color: COLORS.navy }}
                        />
                    </div>

                    {/* Filters & Toggles */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex rounded-xl p-1" style={{ backgroundColor: COLORS.sandLight }}>
                            <button
                                onClick={() => setViewMode("all")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    viewMode === "all" ? "bg-white shadow-xs text-navy" : "text-muted"
                                }`}
                            >
                                All ({filteredGuests.length})
                            </button>
                            <button
                                onClick={() => setViewMode("recent")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    viewMode === "recent" ? "bg-white shadow-xs text-navy" : "text-muted"
                                }`}
                            >
                                Top 10
                            </button>
                        </div>

                        {/* Save The Date Filter */}
                        <select
                            value={stdFilter}
                            onChange={(e: any) => setStdFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                            style={{ backgroundColor: COLORS.sandLight, borderColor: 'transparent', color: COLORS.navy }}
                        >
                            <option value="all">All STD Statuses</option>
                            <option value="std_done">STD Responded</option>
                            <option value="std_pending">STD Pending</option>
                        </select>

                        {/* RSVP Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e: any) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                            style={{ backgroundColor: COLORS.sandLight, borderColor: 'transparent', color: COLORS.navy }}
                        >
                            <option value="all">All RSVP Statuses</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="pending">Pending Response</option>
                        </select>

                        {/* Event Filter */}
                        <select
                            value={eventFilter}
                            onChange={(e: any) => setEventFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl text-xs font-medium border outline-none"
                            style={{ backgroundColor: COLORS.sandLight, borderColor: 'transparent', color: COLORS.navy }}
                        >
                            <option value="all">All Weddings</option>
                            <option value="colombia">Colombia</option>
                            <option value="florida">Florida</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Guest Directory Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: COLORS.sandLight }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.sandLight }}>
                    <h2 className="font-serif text-xl" style={{ color: COLORS.navy }}>
                        Guest Directory
                    </h2>
                    <span className="text-xs uppercase tracking-widest" style={{ color: COLORS.muted }}>
            Showing {displayedGuests.length} of {guests.length} Guests
          </span>
                </div>

                {displayedGuests.length === 0 ? (
                    <div className="p-12 text-center text-muted">
                        <p className="text-sm">No guests found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="border-b text-[11px] uppercase tracking-wider font-semibold" style={{ backgroundColor: COLORS.sandLight, borderColor: COLORS.sand, color: COLORS.navy }}>
                                <th className="py-3 px-6">Guest Name</th>
                                <th className="py-3 px-4">Code</th>
                                <th className="py-3 px-4">Save The Date</th>
                                <th className="py-3 px-4">Final RSVP</th>
                                <th className="py-3 px-4">Destinations</th>
                                <th className="py-3 px-4">Plus One</th>
                                <th className="py-3 px-6">Contact Info</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y text-xs" style={{ borderColor: COLORS.sandLight }}>
                            {displayedGuests.map((guest) => {
                                const isRsvpAccepted = guest.rsvpResponded && (guest.attendingColombia || guest.attendingFlorida);
                                const isRsvpDeclined = guest.rsvpResponded && !guest.attendingColombia && !guest.attendingFlorida;

                                return (
                                    <tr key={guest.id} className="hover:bg-amber-50/30 transition-colors">
                                        {/* Name & Role */}
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-sm" style={{ color: COLORS.navy }}>
                                                {guest.firstName} {guest.lastName}
                                            </div>
                                            {guest.role && guest.role !== "Guest" && (
                                                <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] uppercase font-semibold bg-sky-100 text-sky-800">
                            {guest.role}
                          </span>
                                            )}
                                        </td>

                                        {/* Code */}
                                        <td className="py-4 px-4 font-mono font-medium text-xs" style={{ color: COLORS.navy }}>
                                            {guest.invitationCode || "—"}
                                        </td>

                                        {/* Save The Date (STD) Badge */}
                                        <td className="py-4 px-4">
                                            {guest.stdResponded ? (
                                                <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <BookmarkCheck size={11} /> STD Responded
                            </span>
                                                    <div className="flex gap-1 text-[10px] text-muted">
                                                        {guest.stdAttendingColombia && <span className="bg-slate-100 px-1 rounded">CO</span>}
                                                        {guest.stdAttendingFlorida && <span className="bg-slate-100 px-1 rounded">FL</span>}
                                                        {!guest.stdAttendingColombia && !guest.stdAttendingFlorida && <span>Declined</span>}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
                            <Clock size={11} /> STD Pending
                          </span>
                                            )}
                                        </td>

                                        {/* Final RSVP Badge */}
                                        <td className="py-4 px-4">
                                            {isRsvpAccepted && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Accepted
                          </span>
                                            )}
                                            {isRsvpDeclined && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={12} /> Declined
                          </span>
                                            )}
                                            {!guest.rsvpResponded && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> Pending
                          </span>
                                            )}
                                        </td>

                                        {/* Destination Badges */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-1">
                                                {(guest.attendingColombia || guest.stdAttendingColombia) && (
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${guest.attendingColombia ? 'text-indigo-700' : 'text-indigo-400'}`}>
                              <Plane size={11} /> Colombia {guest.rsvpResponded ? "" : "(STD)"}
                            </span>
                                                )}
                                                {(guest.attendingFlorida || guest.stdAttendingFlorida) && (
                                                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${guest.attendingFlorida ? 'text-amber-700' : 'text-amber-400'}`}>
                              <MapPin size={11} /> Florida {guest.rsvpResponded ? "" : "(STD)"}
                            </span>
                                                )}
                                                {!guest.attendingColombia && !guest.attendingFlorida && !guest.stdAttendingColombia && !guest.stdAttendingFlorida && (
                                                    <span className="text-muted text-[11px]">—</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Plus One Details */}
                                        <td className="py-4 px-4">
                                            {guest.plusOneAllowed ? (
                                                <div className="text-[11px]">
                            <span className="font-medium text-navy flex items-center gap-1">
                              <Users size={11} /> Allowed
                            </span>
                                                    {guest.plusOneName && (
                                                        <span className="text-muted block">{guest.plusOneName}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted text-[11px]">None</span>
                                            )}
                                        </td>

                                        {/* Contact Info */}
                                        <td className="py-4 px-6 space-y-0.5">
                                            {guest.email && (
                                                <div className="flex items-center gap-1 text-muted text-[11px]">
                                                    <Mail size={11} /> {guest.email}
                                                </div>
                                            )}
                                            {guest.phone && (
                                                <div className="flex items-center gap-1 text-muted text-[11px]">
                                                    <Phone size={11} /> {guest.phone}
                                                </div>
                                            )}
                                            {!guest.email && !guest.phone && <span className="text-muted text-[11px]">—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Quick Add Guest Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: COLORS.ivory }}>
                        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: COLORS.sand }}>
                            <h3 className="font-serif text-xl" style={{ color: COLORS.navy }}>
                                Add Guest to List
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-muted hover:text-navy">
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSavingGuest(true);
                                try {
                                    const finalCode = newGuest.invitationCode.trim() ||
                                        `${newGuest.firstName.substring(0, 2)}${newGuest.lastName.substring(0, 2)}2027`.toUpperCase();

                                    await updateGuest("new", {
                                        first_name: newGuest.firstName,
                                        last_name: newGuest.lastName,
                                        email: newGuest.email,
                                        phone: newGuest.phone,
                                        invite_code: finalCode,
                                        role: newGuest.role,
                                        eligible_colombia: newGuest.eligibleColombia,
                                        plus_one_allowed: newGuest.plusOneAllowed,
                                    });

                                    const updatedList = await getAllGuests();
                                    setGuests(updatedList);
                                    setIsAddModalOpen(false);
                                } catch (err) {
                                    alert("Error adding guest. Please check database configuration.");
                                } finally {
                                    setSavingGuest(false);
                                }
                            }}
                            className="p-6 space-y-4 text-xs"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium text-navy">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newGuest.firstName}
                                        onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border outline-none"
                                        style={{ backgroundColor: COLORS.sandLight, borderColor: COLORS.sand }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-navy">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newGuest.lastName}
                                        onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border outline-none"
                                        style={{ backgroundColor: COLORS.sandLight, borderColor: COLORS.sand }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium text-navy">Email</label>
                                    <input
                                        type="email"
                                        value={newGuest.email}
                                        onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border outline-none"
                                        style={{ backgroundColor: COLORS.sandLight, borderColor: COLORS.sand }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-navy">Invitation Code</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated if empty"
                                        value={newGuest.invitationCode}
                                        onChange={(e) => setNewGuest({ ...newGuest, invitationCode: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border outline-none"
                                        style={{ backgroundColor: COLORS.sandLight, borderColor: COLORS.sand }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newGuest.eligibleColombia}
                                        onChange={(e) => setNewGuest({ ...newGuest, eligibleColombia: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span>Eligible for Colombia</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newGuest.plusOneAllowed}
                                        onChange={(e) => setNewGuest({ ...newGuest, plusOneAllowed: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span>Allow Plus One</span>
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t" style={{ borderColor: COLORS.sand }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-muted hover:text-navy"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGuest}
                                    className="px-5 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                                    style={{ backgroundColor: COLORS.navy }}
                                >
                                    {savingGuest && <Loader2 size={14} className="animate-spin" />}
                                    Save Guest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}