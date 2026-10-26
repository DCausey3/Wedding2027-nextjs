"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, animate, useInView, useReducedMotion } from "motion/react";
import {
    Heart, Calendar, CalendarPlus, Mail, Phone, MapPin,
    Shield, Clock, Gift, Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

// Requires: npm i canvas-confetti && npm i -D @types/canvas-confetti

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";
const GREENERY = "#7FAA6E";

const SERIF = "'Cormorant Garamond',serif";
const SANS = "'Inter',sans-serif";

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

interface WeddingInfo {
    key: "colombia" | "florida";
    label: string;
    icon: string;
    dateLabel: string;
    date: Date;          // local date, used for the countdown
    icsDate: string;     // YYYYMMDD, used for the calendar file
    icsEndDate: string;  // day after, all-day events end exclusively
    location: string;
    accent: string;
}

const WEDDINGS: Record<"colombia" | "florida", WeddingInfo> = {
    colombia: {
        key: "colombia",
        label: "Colombia Wedding",
        icon: "COL",
        dateLabel: "June 12, 2027",
        date: new Date(2027, 5, 12),
        icsDate: "20270612",
        icsEndDate: "20270613",
        location: "Manizales, Colombia",
        accent: SKY_MID,
    },
    florida: {
        key: "florida",
        label: "Gainesville Wedding",
        icon: "GNV",
        dateLabel: "April 24, 2027",
        date: new Date(2027, 3, 24),
        icsDate: "20270424",
        icsEndDate: "20270425",
        location: "Gainesville, Florida",
        accent: GREENERY,
    },
};

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

// ─── Helpers ────────────────────────────────────────────────────────────────
async function fireConfetti(origin: { x: number; y: number }, count = 60, spread = 80) {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
        particleCount: count,
        spread,
        startVelocity: 32,
        ticks: 140,
        origin,
        colors: [APRICOT, "#ec4899", SKY, IVORY, GREENERY],
    });
}

function daysUntil(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((date.getTime() - today.getTime()) / 86400000));
}

function calendarHref(w: WeddingInfo) {
    const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Jhoana & Damariel//Wedding//EN",
        "BEGIN:VEVENT",
        `UID:${w.key}-wedding-2027@jhoana-damariel`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART;VALUE=DATE:${w.icsDate}`,
        `DTEND;VALUE=DATE:${w.icsEndDate}`,
        `SUMMARY:Jhoana & Damariel's Wedding (${w.label})`,
        `LOCATION:${w.location}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function CountUp({ to }: { to: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const reduce = useReducedMotion();
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) { setVal(to); return; }
        const controls = animate(0, to, {
            duration: 1.8,
            ease: "easeOut",
            onUpdate: (v) => setVal(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, to, reduce]);

    return <span ref={ref}>{val}</span>;
}

// Fires a confetti celebration once, from both sides, when mounted.
function ConfettiOnMount() {
    const reduce = useReducedMotion();
    useEffect(() => {
        if (reduce) return;
        const t = setTimeout(() => {
            fireConfetti({ x: 0.2, y: 0.3 }, 70);
            fireConfetti({ x: 0.8, y: 0.3 }, 70);
        }, 500);
        return () => clearTimeout(t);
    }, [reduce]);
    return null;
}

const FLOATERS = [
    { left: "6%", top: "14%", size: 14, delay: 0, kind: "sparkle" },
    { left: "88%", top: "10%", size: 12, delay: 0.8, kind: "heart" },
    { left: "12%", top: "46%", size: 10, delay: 1.4, kind: "heart" },
    { left: "92%", top: "42%", size: 14, delay: 0.4, kind: "sparkle" },
    { left: "8%", top: "78%", size: 12, delay: 2, kind: "sparkle" },
    { left: "90%", top: "74%", size: 10, delay: 1.1, kind: "heart" },
] as const;

function Floaters() {
    const reduce = useReducedMotion();
    if (reduce) return null;
    return (
        <>
            {FLOATERS.map((f, i) => {
                const Icon = f.kind === "heart" ? Heart : Sparkles;
                return (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{ left: f.left, top: f.top }}
                        animate={{ y: [0, -16, 0], opacity: [0.2, 0.65, 0.2], rotate: [0, 14, 0] }}
                        transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
                        aria-hidden="true"
                    >
                        <Icon
                            size={f.size}
                            style={{ color: f.kind === "heart" ? "#ec4899" : APRICOT, fill: f.kind === "heart" ? "#ec4899" : "none" }}
                        />
                    </motion.div>
                );
            })}
        </>
    );
}

// Animated check inside the badge — ring ripples + a check that draws itself.
function CheckBadge({ muted }: { muted: boolean }) {
    const reduce = useReducedMotion();
    return (
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            {!muted && !reduce && [0, 1].map((i) => (
                <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${APRICOT}` }}
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
                />
            ))}
            <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                    background: muted
                        ? `radial-gradient(circle at 38% 38%, ${SAND}, #cbb590)`
                        : `radial-gradient(circle at 38% 38%, ${APRICOT}, #d99a63)`,
                    boxShadow: muted ? "none" : `0 12px 36px ${APRICOT}77`,
                }}
            >
                {muted ? (
                    <span className="text-4xl">🌸</span>
                ) : (
                    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                        <motion.path
                            d="M10 24 L20 33 L37 14"
                            stroke={IVORY}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: reduce ? 0 : 0.6, delay: 0.45, ease: "easeOut" }}
                        />
                    </svg>
                )}
            </motion.div>
        </div>
    );
}

// ─── Wedding ticket card with countdown ─────────────────────────────────────
function WeddingTicket({ wedding, index }: { wedding: WeddingInfo; index: number }) {
    const days = daysUntil(wedding.date);
    const { accent } = wedding;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.5 + index * 0.15, type: "spring", stiffness: 120, damping: 14 }}
            whileHover={{ y: -4 }}
            className="relative rounded-2xl overflow-hidden text-left"
            style={{
                backgroundColor: "#fff",
                border: `1.5px solid ${accent}66`,
                boxShadow: `0 10px 30px ${accent}30`,
            }}
        >
            <div className="flex">
                {/* Left stub: countdown */}
                <div
                    className="flex flex-col items-center justify-center px-4 py-5 relative"
                    style={{ backgroundColor: accent, minWidth: 96 }}
                >
                    <span style={{ fontFamily: SERIF, fontSize: "2.4rem", color: SKY_DEEP, fontWeight: 500, lineHeight: 1 }}>
                        <CountUp to={days} />
                    </span>
                    <span className="uppercase mt-1" style={{ fontSize: "0.5rem", letterSpacing: "0.18em", color: SKY_DEEP, opacity: 0.8 }}>
                        days to go
                    </span>
                    {/* ticket notches */}
                    <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full" style={{ backgroundColor: IVORY }} />
                    <span className="absolute -right-2 -bottom-2 w-4 h-4 rounded-full" style={{ backgroundColor: IVORY }} />
                </div>

                {/* Perforation */}
                <div className="my-3" style={{ borderLeft: `2px dashed ${accent}88` }} />

                {/* Right: details */}
                <div className="flex-1 p-4">
                    <div className="flex items-center gap-2">
                        <span
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${accent}25`, color: SKY_DEEP, fontSize: "0.58rem", letterSpacing: "0.12em", fontFamily: SERIF, fontWeight: 600 }}
                        >
                            {wedding.icon}
                        </span>
                        <p className="text-xs font-medium" style={{ color: SKY_DEEP, fontFamily: SANS }}>{wedding.label}</p>
                    </div>
                    <p className="mt-2" style={{ fontFamily: SERIF, fontSize: "1.35rem", color: SKY_DEEP, lineHeight: 1.1 }}>
                        {wedding.dateLabel}
                    </p>
                    <p className="flex items-center gap-1 mt-1 text-xs" style={{ color: `${SKY_DEEP}99`, fontFamily: SANS }}>
                        <MapPin size={11} style={{ color: accent }} /> {wedding.location}
                    </p>
                    <a
                        href={calendarHref(wedding)}
                        download={`${wedding.key}-wedding.ics`}
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-[0.6rem] uppercase transition-opacity hover:opacity-80"
                        style={{ backgroundColor: `${accent}22`, color: SKY_DEEP, letterSpacing: "0.12em", border: `1px solid ${accent}66`, fontFamily: SANS }}
                    >
                        <CalendarPlus size={11} /> Add to calendar
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function MyDetailsPage() {
    const { guest, loaded } = useStoredGuest();
    const reduce = useReducedMotion();

    if (!loaded) return null;

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <div className="text-center max-w-sm">
                    <p style={{ fontFamily: SERIF, fontSize: "1.6rem", color: SKY_DEEP }}>
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

    const attendingWeddings: WeddingInfo[] = [
        ...(attendingFlorida ? [WEDDINGS.florida] : []),
        ...(attendingColombia ? [WEDDINGS.colombia] : []),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const summaryRows = [
        { label: "Guest", value: `${guest.firstName ?? ""} ${guest.lastName ?? ""}`.trim() || "—" },
        { label: "Party", value: `${partySize} ${partySize === 1 ? "guest" : "guests"}` },
        { label: "Attending", value: weddingLabel },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: IVORY }}>
            {!attendingNeither && <ConfettiOnMount />}

            {/* Soft backdrop glow + floaters */}
            <div
                className="absolute inset-x-0 top-0 h-[28rem] pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${APRICOT}40 0%, transparent 65%)` }}
            />
            {!attendingNeither && <Floaters />}

            <div className="max-w-lg mx-auto px-5 pt-24 pb-20 relative z-10">

                {/* Header strip */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex"
                        >
                            <Heart size={12} style={{ color: APRICOT, fill: APRICOT }} />
                        </motion.span>
                        <span className="text-xs uppercase tracking-[0.2em]" style={{ color: SKY_DEEP, fontFamily: SANS }}>
                            Jhoana &amp; Damariel
                        </span>
                        <span
                            className="ml-auto text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${APRICOT}33`, color: SKY_DEEP, fontFamily: SANS }}
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
                    <CheckBadge muted={attendingNeither} />

                    <p className="text-[0.6rem] uppercase tracking-[0.28em] mb-3 flex items-center justify-center gap-2" style={{ color: "#c97f3f" }}>
                        <Sparkles size={11} />
                        {attendingNeither ? "Response Received" : "Save the Date Confirmed"}
                        <Sparkles size={11} />
                    </p>

                    <h1
                        style={{
                            fontFamily: SERIF,
                            fontSize: "clamp(2.2rem, 7vw, 3.2rem)",
                            fontWeight: 300,
                            color: SKY_DEEP,
                            lineHeight: 1.05,
                        }}
                    >
                        {attendingNeither ? (
                            <>We&apos;ll miss you, <span style={{ fontStyle: "italic", color: "#c97f3f" }}>{guest.firstName}</span></>
                        ) : (
                            <>Thank you, <span style={{ fontStyle: "italic", color: "#c97f3f" }}>{guest.firstName}</span>!</>
                        )}
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
                        style={{
                            background: `linear-gradient(138deg, ${SKY_DEEP} 0%, #0c283a 100%)`,
                            boxShadow: `0 18px 40px ${SKY_DEEP}40`,
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.16]"
                            style={{
                                backgroundImage:
                                    `radial-gradient(circle at 20% 50%, ${APRICOT}, transparent 50%), radial-gradient(circle at 80% 30%, ${SKY}, transparent 50%)`,
                            }}
                        />
                        {/* shimmer sweep */}
                        {!reduce && (
                            <motion.div
                                className="absolute top-0 bottom-0 w-1/3 pointer-events-none"
                                style={{ background: "linear-gradient(100deg, transparent, rgba(255,247,236,0.12), transparent)" }}
                                initial={{ x: "-120%" }}
                                animate={{ x: "420%" }}
                                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
                            />
                        )}
                        <div className="relative z-10">
                            <p className="text-[0.58rem] uppercase tracking-[0.24em] mb-4" style={{ color: APRICOT }}>
                                Your Confirmation
                            </p>
                            {summaryRows.map((row, i) => (
                                <motion.div
                                    key={row.label}
                                    initial={{ opacity: 0, x: -14 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.12 }}
                                    className="flex justify-between py-2.5 border-b last:border-b-0"
                                    style={{ borderColor: "rgba(255,247,236,0.1)" }}
                                >
                                    <span className="text-xs" style={{ color: "rgba(255,247,236,0.5)" }}>{row.label}</span>
                                    <span className="text-sm" style={{ color: IVORY, fontFamily: SANS }}>{row.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Wedding tickets with countdowns */}
                    {attendingWeddings.length > 0 && (
                        <div className="space-y-4 mt-6">
                            {attendingWeddings.map((w, i) => (
                                <WeddingTicket key={w.key} wedding={w} index={i} />
                            ))}
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
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${APRICOT}30` }}>
                                <Gift size={15} style={{ color: APRICOT }} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em]" style={{ color: `${SKY_DEEP}80` }}>
                                    Want to celebrate from afar?
                                </p>
                                <p className="text-sm mt-1" style={{ color: SKY_DEEP, fontFamily: SANS }}>
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
                            transition={{ delay: 0.8 }}
                            className="mt-5 p-5 rounded-2xl text-left flex items-start gap-3"
                            style={{ backgroundColor: SAND_LIGHT, border: `1px solid ${SAND}` }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${APRICOT}30` }}>
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
                                <p className="text-sm mt-1 break-all" style={{ color: SKY_DEEP, fontFamily: SANS }}>
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
                            transition={{ delay: 0.9 }}
                            className="mt-5 p-5 rounded-2xl text-left"
                            style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}44` }}
                        >
                            <p className="text-[0.58rem] uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: "#c97f3f" }}>
                                <Clock size={11} /> What Happens Next
                            </p>
                            <div className="relative">
                                {/* connecting line */}
                                <div
                                    className="absolute left-[9px] top-3 bottom-3 w-px"
                                    style={{ backgroundColor: `${APRICOT}88` }}
                                />
                                {[
                                    "Your official RSVP invitation will be sent closer to the wedding.",
                                    "You'll confirm your entrée, plus-one, and travel details there.",
                                    "In the meantime, feel free to explore travel and wedding info below.",
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.05 + i * 0.15 }}
                                        className="flex items-start gap-3 mb-4 last:mb-0 relative"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10"
                                            style={{ backgroundColor: APRICOT, boxShadow: `0 0 0 4px ${IVORY}` }}
                                        >
                                            <span className="text-[0.52rem] font-medium" style={{ color: SKY_DEEP }}>{i + 1}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed" style={{ color: `${SKY_DEEP}99` }}>{item}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div
                        className="p-3.5 rounded-xl mt-5 flex items-start gap-2.5"
                        style={{ backgroundColor: `${SKY_DEEP}08`, border: `1px solid ${SKY_DEEP}14` }}
                    >
                        <Shield size={13} style={{ color: `${SKY_DEEP}55`, marginTop: 1, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed text-left" style={{ color: `${SKY_DEEP}80` }}>
                            Need to update your details? Reach out to us directly and we&apos;ll take care of it before the formal RSVP opens.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href="/home"
                            onClick={(e) => {
                                if (reduce || attendingNeither) return;
                                const r = e.currentTarget.getBoundingClientRect();
                                fireConfetti(
                                    { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
                                    30,
                                    60,
                                );
                            }}
                            className="block w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] text-center transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: SKY_DEEP, color: IVORY, fontFamily: SANS, boxShadow: `0 8px 24px ${SKY_DEEP}40` }}
                        >
                            Return Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}