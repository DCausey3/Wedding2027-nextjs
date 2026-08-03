"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Heart, CheckCircle2, Calendar, Mail, Phone,
    Shield, Clock, Gift,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54"; // deep shade of the sky-blue hue — replaces navy everywhere
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const PEACH = "#FFE4CB";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3"; // mid accent — icons, secondary labels
const GREENERY = "#7FAA6E";
const GREENERY_DARK = "#4d6b43"; // higher-contrast variant of GREENERY for text on light bg

interface DetailsGuest {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    plusOneAllowed?: boolean;
    plusOneCount?: number;
    stdResponded?: boolean;
    stdAttendingColombia?: boolean;
    stdAttendingFlorida?: boolean;
}

function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
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
            style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}44` }}
        >
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: accent }}
            >
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.6rem", color: SKY_DEEP }}>
          {icon}
        </span>
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: accent }}>{label}</p>
                <p className="text-sm" style={{ color: SKY_DEEP }}>{date} · {location}</p>
            </div>
            <Calendar size={13} style={{ color: `${SKY_DEEP}40` }} />
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
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.6rem", color: SKY_DEEP }}>
                        We couldn&apos;t find your details.
                    </p>
                    <p className="mt-2 text-sm" style={{ color: `${SKY_DEEP}99` }}>
                        Please log in again to view your save-the-date confirmation.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block mt-6 px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: "0.15em" }}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Source of truth is what they actually confirmed, not what they were eligible for.
    const attendingColombia = isTruthy(guest.stdAttendingColombia);
    const attendingFlorida = isTruthy(guest.stdAttendingFlorida);
    const attendingBoth = attendingColombia && attendingFlorida;
    const attendingNeither = !attendingColombia && !attendingFlorida;

    const partySize = (guest.plusOneCount ?? 0) + 1;
    const contactAddress = guest.email || guest.phone || null;

    const weddingLabel = attendingBoth
        ? "Both Weddings"
        : attendingColombia
            ? "Colombia Wedding"
            : attendingFlorida
                ? "Gainesville Wedding"
                : "Not Attending";

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-24 pb-20">

                {/* Header strip */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2">
                        <Heart size={12} style={{ color: APRICOT, fill: APRICOT }} />
                        <span
                            className="text-xs uppercase tracking-[0.2em]"
                            style={{ color: SKY_DEEP, fontFamily: "'Inter',sans-serif" }}
                        >
              Jhoana &amp; Damariel
            </span>
                        <span
                            className="ml-auto text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${APRICOT}22`, color: SKY_DEEP, fontFamily: "'Inter',sans-serif" }}
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
                        style={{
                            background: attendingNeither
                                ? `radial-gradient(circle at 38% 38%, ${SAND}, #cbb590)`
                                : `radial-gradient(circle at 38% 38%, ${APRICOT}, #d99a63)`,
                        }}
                    >
                        {attendingNeither ? (
                            <span className="text-4xl">🌸</span>
                        ) : (
                            <CheckCircle2 size={44} style={{ color: IVORY }} />
                        )}
                    </motion.div>

                    <p className="text-[0.6rem] uppercase tracking-[0.28em] mb-3" style={{ color: APRICOT }}>
                        {attendingNeither ? "Response Received ✦" : "Save the Date Confirmed ✦"}
                    </p>

                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: "clamp(2rem, 6vw, 2.8rem)",
                            fontWeight: 300,
                            color: SKY_DEEP,
                            lineHeight: 1.08,
                        }}
                    >
                        {attendingNeither ? `We'll miss you, ${guest.firstName}` : `Thank you, ${guest.firstName}!`}
                    </h1>

                    <p className="mt-4 text-sm leading-relaxed mx-auto max-w-xs" style={{ color: `${SKY_DEEP}99` }}>
                        {attendingNeither
                            ? "We're so grateful you're still part of our story — you're always welcome to celebrate from afar."
                            : `We've saved your spot${partySize > 1 ? ` for ${partySize} guests` : ""}. Your official RSVP invitation is on its way.`}
                    </p>

                    {/* Summary card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 p-6 rounded-2xl text-left relative overflow-hidden"
                        style={{ background: `linear-gradient(138deg, ${SKY_DEEP} 0%, #0c283a 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.14]"
                            style={{
                                backgroundImage:
                                    `radial-gradient(circle at 20% 50%, ${APRICOT}, transparent 50%), radial-gradient(circle at 80% 30%, ${SKY}, transparent 50%)`,
                            }}
                        />
                        <div className="relative z-10">
                            <p className="text-[0.58rem] uppercase tracking-[0.24em] mb-4" style={{ color: APRICOT }}>
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
                                    style={{ borderColor: "rgba(255,247,236,0.1)" }}
                                >
                                    <span className="text-xs" style={{ color: "rgba(255,247,236,0.5)" }}>{row.label}</span>
                                    <span className="text-sm" style={{ color: IVORY, fontFamily: "'Inter',sans-serif" }}>
                    {row.value}
                  </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Wedding dates */}
                    {(attendingColombia || attendingFlorida) && (
                        <div className="space-y-2.5 mt-5">
                            {attendingColombia && (
                                <WeddingChip
                                    label="Colombia Wedding"
                                    date="June,2027"
                                    location="Pereira, Colombia"
                                    accent={SKY_MID}
                                    icon="COL"
                                />
                            )}
                            {attendingFlorida && (
                                <WeddingChip
                                    label="Gainesville Wedding"
                                    date="April 24, 2027"
                                    location="Gainesville, Florida"
                                    accent={GREENERY}
                                    icon="GNV"
                                />
                            )}
                        </div>
                    )}

                    {/* Registry nudge for guests who can't make it */}
                    {attendingNeither && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-5 p-5 rounded-2xl text-left flex items-start gap-3"
                            style={{ backgroundColor: SAND_LIGHT, border: `1px solid ${SAND}` }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${APRICOT}30` }}
                            >
                                <Gift size={15} style={{ color: APRICOT }} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: `${SKY_DEEP}80` }}>
                                    Want to celebrate from afar?
                                </p>
                                <p className="text-sm mt-1" style={{ color: SKY_DEEP, fontFamily: "'Inter',sans-serif" }}>
                                    You&apos;re always welcome to send a gift from our registry.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Contact on file */}
                    {contactAddress && !attendingNeither && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="mt-5 p-5 rounded-2xl text-left flex items-start gap-3"
                            style={{ backgroundColor: SAND_LIGHT, border: `1px solid ${SAND}` }}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${APRICOT}30` }}
                            >
                                {guest.email ? (
                                    <Mail size={15} style={{ color: APRICOT }} />
                                ) : (
                                    <Phone size={15} style={{ color: APRICOT }} />
                                )}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: `${SKY_DEEP}80` }}>
                                    We&apos;ll send your official RSVP to
                                </p>
                                <p className="text-sm mt-1" style={{ color: SKY_DEEP, fontFamily: "'Inter',sans-serif" }}>
                                    {contactAddress}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* What happens next */}
                    {!attendingNeither && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-5 p-5 rounded-2xl text-left"
                            style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}44` }}
                        >
                            <p className="text-[0.58rem] uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: "#c97f3f" }}>
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
                                        style={{ backgroundColor: APRICOT }}
                                    >
                                        <span className="text-[0.52rem] font-medium" style={{ color: SKY_DEEP }}>{i + 1}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: `${SKY_DEEP}99` }}>{item}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <div className="p-3.5 rounded-xl mt-5 flex items-start gap-2.5" style={{ backgroundColor: `${SKY_DEEP}08`, border: `1px solid ${SKY_DEEP}14` }}>
                        <Shield size={13} style={{ color: `${SKY_DEEP}55`, marginTop: 1, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed text-left" style={{ color: `${SKY_DEEP}80` }}>
                            Need to update your details? Reach out to us directly and we&apos;ll take care of it before the formal RSVP opens.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href="/home"
                            className="block w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] text-center transition-all hover:opacity-80"
                            style={{ backgroundColor: SKY_DEEP, color: IVORY, fontFamily: "'Inter',sans-serif" }}
                        >
                            Return Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}