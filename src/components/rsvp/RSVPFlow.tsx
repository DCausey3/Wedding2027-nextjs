"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Heart, CheckCircle2, Calendar, MapPin, Mail, Phone,
    Users, Shield, Clock, Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Brand tokens (matches RSVP flow) ─────────────────────────────────────────
const GOLD    = "#d4a574";
const DARK    = "#1a1209";
const IVORY   = "#fdf8f0";
const CHAMP   = "#f5ede0";
const TEAL    = "#0d9488";
const EMERALD = "#059669";

type SelectedWedding = "Colombia" | "USA" | "Both" | null;

interface DetailsGuest {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    selectedWedding?: SelectedWedding;
    plusOneAllowed?: boolean;
    plusOneCount?: number;
    stdResponded?: boolean;
    stdAttendingColombia?: boolean;
    stdAttendingFlorida?: boolean;
}

function useStoredGuest() {
    const { guest: authGuest } = useAuth();
    const [guest, setGuest] = useState<DetailsGuest | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (authGuest) {
            setGuest(authGuest as DetailsGuest);
            setLoaded(true);
            return;
        }
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                setGuest(JSON.parse(stored));
            } catch {
                // ignore malformed storage
            }
        }
        setLoaded(true);
    }, [authGuest]);

    return { guest, loaded };
}

function WeddingChip({
                         label, date, location, accent, icon,
                     }: { label: string; date: string; location: string; accent: string; icon: string }) {
    return (
        <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ backgroundColor: `${accent}0e`, border: `1px solid ${accent}22` }}
        >
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: accent }}
            >
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.6rem", color: IVORY }}>
          {icon}
        </span>
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: accent }}>{label}</p>
                <p className="text-sm" style={{ color: DARK }}>{date} · {location}</p>
            </div>
            <Calendar size={13} style={{ color: `${DARK}28` }} />
        </div>
    );
}

export default function MyDetailsPage() {
    const { guest, loaded } = useStoredGuest();

    if (!loaded) return null;

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <div className="text-center max-w-sm">
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: DARK }}>
                        We couldn&apos;t find your details.
                    </p>
                    <p className="mt-2 text-sm" style={{ color: `${DARK}62` }}>
                        Please log in again to view your save-the-date confirmation.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block mt-6 px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ backgroundColor: DARK, color: IVORY, letterSpacing: "0.15em" }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    const showColombia = guest.selectedWedding === "Colombia" || guest.selectedWedding === "Both";
    const showFlorida  = guest.selectedWedding === "USA" || guest.selectedWedding === "Both";
    const partySize = (guest.plusOneCount ?? 0) + 1;
    const contactAddress = guest.email || guest.phone || null;

    const weddingLabel =
        guest.selectedWedding === "Both"     ? "Both Weddings"    :
            guest.selectedWedding === "Colombia" ? "Colombia Wedding" :
                guest.selectedWedding === "USA"      ? "USA Wedding"      : "—";

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-24 pb-20">

                {/* Header strip */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2">
                        <Heart size={12} style={{ color: GOLD, fill: GOLD }} />
                        <span
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: DARK, fontFamily: "'Inter',sans-serif" }}
                        >
              Jhoana &amp; Damariel
            </span>
                        <span
                            className="ml-auto text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${GOLD}14`, color: DARK, fontFamily: "'Inter',sans-serif" }}
                        >
              {guest.firstName}
            </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-2"
                >
                    <motion.div
                        initial={{ scale: 0.45, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: `radial-gradient(circle at 38% 38%, ${GOLD}, #b8926a)` }}
                    >
                        <CheckCircle2 size={44} style={{ color: IVORY }} />
                    </motion.div>

                    <p className="text-[0.6rem] uppercase tracking-[0.28em] mb-3" style={{ color: GOLD }}>
                        Save the Date Confirmed ✦
                    </p>

                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: "clamp(2rem, 6vw, 2.8rem)",
                            fontWeight: 300,
                            color: DARK,
                            lineHeight: 1.08,
                        }}
                    >
                        Thank you, {guest.firstName}!
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed mx-auto max-w-xs" style={{ color: `${DARK}62` }}>
                        We&apos;ve saved your spot{partySize > 1 ? ` for ${partySize} guests` : ""}.
                        Your official RSVP invitation is on its way.
                    </p>

                    {/* Summary card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 p-6 rounded-2xl text-left relative overflow-hidden"
                        style={{ background: `linear-gradient(138deg, ${DARK} 0%, #2d1f0e 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.12]"
                            style={{
                                backgroundImage:
                                    `radial-gradient(circle at 20% 50%, ${GOLD}, transparent 50%), radial-gradient(circle at 80% 30%, ${TEAL}, transparent 50%)`,
                            }}
                        />
                        <div className="relative z-10">
                            <p className="text-[0.58rem] uppercase tracking-[0.24em] mb-4" style={{ color: GOLD }}>
                                Your Confirmation
                            </p>
                            {[
                                { label: "Guest",     value: `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim() || "—" },
                                { label: "Party",     value: `${partySize} ${partySize === 1 ? "guest" : "guests"}` },
                                { label: "Attending", value: weddingLabel },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    className="flex justify-between py-2.5 border-b"
                                    style={{ borderColor: "rgba(255,255,255,0.07)" }}
                                >
                                    <span className="text-xs" style={{ color: "rgba(253,248,240,0.48)" }}>{row.label}</span>
                                    <span className="text-sm" style={{ color: IVORY, fontFamily: "'Inter',sans-serif" }}>
                    {row.value}
                  </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Wedding dates */}
                    {(showColombia || showFlorida) && (
                        <div className="space-y-2.5 mt-5">
                            {showColombia && (
                                <WeddingChip
                                    label="Colombia Wedding"
                                    date="November 7, 2026"
                                    location="Pereira, Colombia"
                                    accent={TEAL}
                                    icon="COL"
                                />
                            )}
                            {showFlorida && (
                                <WeddingChip
                                    label="USA Wedding"
                                    date="December 12, 2026"
                                    location="Miami, Florida"
                                    accent={EMERALD}
                                    icon="USA"
                                />
                            )}
                        </div>
                    )}

                    {/* Contact on file */}
                    {contactAddress && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="mt-5 p-5 rounded-2xl text-left flex items-start gap-3"
                            style={{ backgroundColor: CHAMP, border: `1px solid ${DARK}0e` }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${GOLD}18` }}
                            >
                                {guest.email ? (
                                    <Mail size={15} style={{ color: GOLD }} />
                                ) : (
                                    <Phone size={15} style={{ color: GOLD }} />
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: `${DARK}52` }}>
                                    We&apos;ll send your official RSVP to
                                </p>
                                <p className="text-sm mt-1" style={{ color: DARK, fontFamily: "'Inter',sans-serif" }}>
                                    {contactAddress}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* What happens next */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-5 p-5 rounded-2xl text-left"
                        style={{ backgroundColor: `${GOLD}0f`, border: `1px solid ${GOLD}22` }}
                    >
                        <p className="text-[0.58rem] uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: GOLD }}>
                            <Clock size={11} /> What Happens Next
                        </p>
                        {[
                            "Your official RSVP invitation will be sent closer to the wedding.",
                            "You'll confirm your entrée, plus-one, and travel details there.",
                            "In the meantime, feel free to explore travel and wedding info below.",
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: GOLD }}
                                >
                                    <span className="text-[0.52rem] text-white font-medium">{i + 1}</span>
                                </div>
                                <p className="text-xs leading-relaxed" style={{ color: `${DARK}68` }}>{item}</p>
                            </div>
                        ))}
                    </motion.div>

                    <div className="p-3.5 rounded-xl mt-5 flex items-start gap-2.5" style={{ backgroundColor: `${DARK}05`, border: `1px solid ${DARK}08` }}>
                        <Shield size={13} style={{ color: `${DARK}38`, marginTop: 1, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed text-left" style={{ color: `${DARK}52` }}>
                            Need to update your details? Reach out to us directly and we&apos;ll take care of it before the formal RSVP opens.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href="/home"
                            className="block w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] text-center transition-all hover:opacity-80"
                            style={{ backgroundColor: DARK, color: IVORY, fontFamily: "'Inter',sans-serif" }}
                        >
                            Return Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}