"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart, Loader2, CheckCircle, Calendar, Sparkles, Bell, Gift, Mail, Phone as PhoneIcon, Home,
} from "lucide-react";

// Palette — Sky Blue + Apricot + Ivory + Sand
const NAVY = "#2c3e4a";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const GREENERY = "#7FAA6E";
const MUTED = "#8a9aa5";

type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    selectedWedding: "Colombia" | "USA" | "Both" | null;
    plusOneCount: number | null;
    plusOneAllowed: boolean | null;
    role?: string | null;
    invitationType?: string | null;
    phone?: string | null;
    email?: string | null;
};

function isBridalParty(guest: Guest) {
    return guest.role === "bridal_party" || guest.invitationType === "bridal_party";
}

function fireConfetti() {
    import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        const colors = [APRICOT, SKY, "#fff", GREENERY, SAND];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 60 }), 300);
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 120 }), 400);
    }).catch(() => {});
}

const WEDDING_INFO: Record<string, { label: string; date: string; place: string; color: string; micro?: boolean }> = {
    Colombia: { label: "Colombia Wedding", date: "June 12, 2027", place: "Pereira, Colombia", color: SKY },
    USA: { label: "Fort Worth Wedding", date: "April 30, 2027", place: "Fort Worth, Texas", color: APRICOT, micro: true },
};

// What attendance choice is even possible for this guest, based on
// selectedWedding + role.
type AttendChoice = "both" | "colombia" | "usa" | "decline" | null;

function getChoiceMode(guest: Guest): "single-colombia" | "single-usa" | "both-bridal" | "both-family" {
    if (guest.selectedWedding === "Colombia") return "single-colombia";
    if (guest.selectedWedding === "USA") return "single-usa";
    // selectedWedding === "Both"
    return isBridalParty(guest) ? "both-bridal" : "both-family";
}

function SaveTheDateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestId = searchParams.get("guest");

    const [guest, setGuest] = useState<Guest | null>(null);
    const [loadError, setLoadError] = useState("");
    const [attendChoice, setAttendChoice] = useState<AttendChoice>(null);
    const [headcount, setHeadcount] = useState(1);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [smsConsent, setSmsConsent] = useState(false);
    const [declineNote, setDeclineNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const confettiFired = useRef(false);
    const bridal = guest ? isBridalParty(guest) : false;
    const choiceMode = guest ? getChoiceMode(guest) : null;

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.id === guestId) {
                    setGuest(parsed);
                    setHeadcount(parsed.plusOneAllowed && parsed.plusOneCount ? parsed.plusOneCount + 1 : 1);
                    setPhone(parsed.phone ?? "");
                    setEmail(parsed.email ?? "");
                    return;
                }
            } catch {
                // fall through to error state
            }
        }

        if (!guestId) {
            setLoadError("Missing guest reference. Please log in again.");
            return;
        }

        setLoadError("We couldn't find your session. Please log in again.");
    }, [guestId]);

    useEffect(() => {
        if (bridal && !confettiFired.current) {
            confettiFired.current = true;
            setTimeout(fireConfetti, 500);
        }
    }, [bridal]);

    // Which wedding cards to show informationally (before/regardless of their choice) —
    // i.e. what this guest is eligible for.
    const infoWeddingKeys =
        guest?.selectedWedding === "Both"
            ? ["Colombia", "USA"]
            : guest?.selectedWedding
                ? [guest.selectedWedding]
                : [];

    // Which weddings the guest is actually committing to attend, based on attendChoice.
    const attendingWeddingKeys: string[] =
        attendChoice === "both" ? ["Colombia", "USA"]
            : attendChoice === "colombia" ? ["Colombia"]
                : attendChoice === "usa" ? ["USA"]
                    : [];

    const isAttendingAnything = attendChoice !== null && attendChoice !== "decline";
    const includesFortWorth = attendingWeddingKeys.includes("USA");

    // Bridal party declining entirely — we'd like a note since Colombia is our preferred fallback.
    const showDeclineNote = choiceMode === "both-bridal" && attendChoice === "decline";

    const maxHeadcount = guest?.plusOneAllowed && guest.plusOneCount
        ? guest.plusOneCount + 1
        : 1;
    const showHeadcountBlock = guest?.plusOneAllowed && (guest?.plusOneCount ?? 0) > 0;

    const canSubmit =
        attendChoice !== null &&
        (attendChoice === "decline" || (phone.trim() && email.trim()));

    const handleSubmit = async () => {
        if (!canSubmit || !guest) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/std-rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: guest.id,
                    attending: isAttendingAnything,
                    attendingWeddings: attendingWeddingKeys,
                    headcount: isAttendingAnything ? headcount : 0,
                    phone: isAttendingAnything ? phone : undefined,
                    email: isAttendingAnything ? email : undefined,
                    smsConsent: isAttendingAnything ? smsConsent : false,
                    declineNote: showDeclineNote ? declineNote : undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Submission failed");

            sessionStorage.setItem(
                "guest",
                JSON.stringify({
                    ...guest,
                    stdResponded: true,
                    stdAttendingColombia: attendingWeddingKeys.includes("Colombia"),
                    stdAttendingFlorida: attendingWeddingKeys.includes("USA"),
                })
            );

            if (isAttendingAnything) fireConfetti();
            setDone(true);
            setTimeout(() => router.push(`/?guest=${guest.id}`), 2200);
        } catch (err: any) {
            alert(err.message ?? "Something went wrong saving your response. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <div className="rounded-2xl p-8 text-center max-w-sm" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                    <p className="text-sm" style={{ color: `${NAVY}99` }}>{loadError}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-5 px-7 py-3 rounded-full text-xs uppercase tracking-[0.15em]"
                        style={{ backgroundColor: APRICOT, color: "#fff" }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                <Loader2 size={24} className="animate-spin" style={{ color: APRICOT }} />
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-10 text-center max-w-sm"
                    style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: isAttendingAnything ? `radial-gradient(circle at 38% 38%, ${APRICOT}, #d99a63)` : SAND_LIGHT }}
                    >
                        {isAttendingAnything ? <CheckCircle size={28} style={{ color: "#fff" }} /> : <span className="text-2xl">🌸</span>}
                    </motion.div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.9rem", fontWeight: 300, color: NAVY }}>
                        {isAttendingAnything ? "Thank you, we can't wait!" : "We'll miss you"}
                    </h2>
                    {!isAttendingAnything && (
                        <div className="mt-4 flex items-start gap-2.5 text-left p-4 rounded-xl" style={{ backgroundColor: SAND_LIGHT }}>
                            <Gift size={15} style={{ color: APRICOT, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-xs leading-relaxed" style={{ color: `${NAVY}68` }}>
                                You're always welcome to return to this site if you'd like to send a gift from our registry.
                            </p>
                        </div>
                    )}
                    <p className="mt-4 text-sm" style={{ color: `${NAVY}66` }}>Taking you to the homepage…</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-20 pb-20">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                    {/* Cinematic hero */}
                    <div
                        className="relative rounded-2xl overflow-hidden mb-7 p-7 sm:p-9"
                        style={{ background: `linear-gradient(140deg, ${NAVY} 0%, #1f2e38 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.14]"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 50%, ${APRICOT}, transparent 50%), radial-gradient(circle at 80% 30%, ${bridal ? "#ec4899" : SKY}, transparent 50%)`,
                            }}
                        />
                        <div className="relative z-10">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[0.58rem] uppercase tracking-[0.3em] mb-4"
                                style={{ color: bridal ? "#f9a8d4" : APRICOT }}
                            >
                                {bridal ? "✦ Bridal Party · You're Part of Our Inner Circle ✦" : "Save the Date"}
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.85rem, 5vw, 2.5rem)", fontWeight: 300, color: IVORY, lineHeight: 1.05 }}
                            >
                                Welcome, {guest.firstName}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="mt-4 text-sm leading-relaxed"
                                style={{ color: "rgba(255,247,236,0.72)" }}
                            >
                                {bridal
                                    ? "We are so glad to have you as part of the bridal party. We're having two celebrations and would love to have you at both — if you're only able to make one, we'd love for it to be Colombia, but please just let us know."
                                    : choiceMode === "both-family"
                                        ? "Jhoana and Damariel are so excited to celebrate with you. We're having two celebrations — please let us know which you'll be able to join."
                                        : "Jhoana and Damariel are so excited to celebrate with you. Please confirm whether you'll be able to join us."}
                            </motion.p>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-xs italic" style={{ color: APRICOT }}>
                                — Jhoana &amp; Damariel
                            </motion.p>
                        </div>
                    </div>

                    {/* Wedding date cards — informational, shown regardless of choice made yet */}
                    <div className="space-y-2.5 mb-3">
                        {infoWeddingKeys.map((key) => {
                            const info = WEDDING_INFO[key];
                            if (!info) return null;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-4 p-4 rounded-xl"
                                    style={{ backgroundColor: `${info.color}18`, border: `1px solid ${info.color}44` }}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: info.color }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.6rem", color: NAVY }}>
                      {key === "Colombia" ? "COL" : "FTW"}
                    </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium" style={{ color: NAVY }}>{info.label}</p>
                                        <p className="text-sm" style={{ color: NAVY }}>{info.date} · {info.place}</p>
                                    </div>
                                    <Calendar size={13} style={{ color: `${NAVY}40` }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Micro-wedding notice — always shown when Fort Worth is in play for this guest */}
                    {infoWeddingKeys.includes("USA") && (
                        <div
                            className="rounded-xl p-4 mb-7 flex items-start gap-2.5"
                            style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}44` }}
                        >
                            <Home size={14} style={{ color: APRICOT, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-xs leading-relaxed" style={{ color: `${NAVY}90` }}>
                                Our Fort Worth celebration will be a <strong>small, micro-intimate gathering</strong> — due to
                                space, we unfortunately aren't able to expand this guest list. If a headcount is shown below,
                                it already includes you.
                            </p>
                        </div>
                    )}

                    {/* Intimate guest list disclaimer (general) */}
                    <div className="rounded-xl p-4 mb-7 flex items-start gap-2.5" style={{ backgroundColor: `${NAVY}05`, border: `1px solid ${NAVY}10` }}>
                        <Heart size={13} style={{ color: `${NAVY}55`, marginTop: 2, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed" style={{ color: `${NAVY}75` }}>
                            This will be an intimate celebration with family and close friends only. If there's someone in your
                            party who isn't reflected here, we sincerely apologize and hope you understand.
                        </p>
                    </div>

                    {/* Attendance — single wedding (Colombia only or USA only) */}
                    {(choiceMode === "single-colombia" || choiceMode === "single-usa") && (
                        <div className="space-y-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice(choiceMode === "single-colombia" ? "colombia" : "usa")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${isAttendingAnything ? APRICOT : `${NAVY}12`}`,
                                    backgroundColor: isAttendingAnything ? `${APRICOT}14` : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            Joyfully Accepts
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>We'll be there to celebrate!</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("decline")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "decline" ? MUTED : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "decline" ? SAND_LIGHT : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🌸</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            Declines with Regret
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>We'll miss you, but understand.</p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    )}

                    {/* Attendance — bridal party, Both (all-or-nothing, Colombia preferred fallback) */}
                    {choiceMode === "both-bridal" && (
                        <div className="space-y-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("both")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "both" ? "#ec4899" : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "both" ? "#ec489914" : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            Joyfully Accepts Both
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>We'll celebrate with you in Colombia and Fort Worth!</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("decline")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "decline" ? MUTED : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "decline" ? SAND_LIGHT : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🌸</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            Can't Make Either
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>We'll miss you — let us know below if that changes.</p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    )}

                    {/* Attendance — family, Both (free choice: Colombia only / USA only / Both / decline) */}
                    {choiceMode === "both-family" && (
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("both")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "both" ? APRICOT : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "both" ? `${APRICOT}14` : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🎉 We'll Attend Both
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>Colombia and Fort Worth</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("colombia")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "colombia" ? SKY : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "colombia" ? `${SKY}20` : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🌎 Colombia Only
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>June 12, 2027 · Pereira</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("usa")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "usa" ? APRICOT : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "usa" ? `${APRICOT}14` : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🤠 Fort Worth Only
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>April 30, 2027 · Texas (micro-intimate)</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("decline")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "decline" ? MUTED : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "decline" ? SAND_LIGHT : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🌸 Can't Attend Either
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>We'll miss you, but understand.</p>
                            </motion.button>
                        </div>
                    )}

                    {/* Headcount — only when attending something with plus-ones allowed */}
                    {isAttendingAnything && showHeadcountBlock && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em] mb-2" style={{ color: `${NAVY}60` }}>
                                Total guests, including yourself: up to {maxHeadcount}
                            </p>
                            <p className="text-xs mb-3" style={{ color: `${NAVY}70` }}>
                                This count already includes you. If your actual party is smaller, please update the number below.
                                {includesFortWorth && " Fort Worth's guest list is fixed, so please keep this number accurate."}
                            </p>
                            <input
                                type="number"
                                min={1}
                                max={maxHeadcount}
                                value={headcount}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setHeadcount(Math.max(1, Math.min(v, maxHeadcount)));
                                }}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                            />
                        </motion.div>
                    )}

                    {/* Contact info — required when attending something */}
                    {isAttendingAnything && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5 space-y-4" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: `${NAVY}60` }}>
                                Stay in the loop
                            </p>
                            <p className="text-xs -mt-2" style={{ color: `${NAVY}70` }}>
                                We'll keep you updated as the wedding gets closer.
                            </p>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>
                                    <Mail size={11} style={{ color: APRICOT }} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>
                                    <PhoneIcon size={11} style={{ color: APRICOT }} /> Phone
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                                />
                            </div>

                            {/* SMS consent toggle */}
                            <div className="flex items-start justify-between gap-4 pt-2 border-t" style={{ borderColor: SAND }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${APRICOT}22` }}>
                                        <Bell size={14} style={{ color: APRICOT }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: NAVY }}>Text Message Updates</p>
                                        <p className="text-[0.65rem] mt-0.5" style={{ color: `${NAVY}60` }}>Optional reminders by text</p>
                                    </div>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={smsConsent}
                                    onClick={() => setSmsConsent(!smsConsent)}
                                    className="flex-shrink-0 w-10 h-6 rounded-full relative transition-colors mt-0.5"
                                    style={{ backgroundColor: smsConsent ? APRICOT : SAND }}
                                >
                                    <motion.div
                                        animate={{ x: smsConsent ? 18 : 2 }}
                                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>
                            {smsConsent && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[0.58rem] leading-relaxed" style={{ color: `${NAVY}50` }}>
                                    By enabling, you consent to receive text messages about the wedding. Msg &amp; data rates may apply. Reply STOP to opt out anytime.
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                    {/* Decline reason — bridal party declining both only */}
                    {showDeclineNote && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <label className="text-[0.6rem] uppercase tracking-[0.18em] mb-2 block" style={{ color: `${NAVY}60` }}>
                                Help us understand (optional)
                            </label>
                            <p className="text-xs mb-3" style={{ color: `${NAVY}70` }}>
                                If there's a reason you're unable to join — travel, health, or otherwise — feel free to share.
                                And if there's any chance you could still make it to just one celebration, let us know here too.
                            </p>
                            <textarea
                                rows={3}
                                value={declineNote}
                                onChange={(e) => setDeclineNote(e.target.value)}
                                placeholder="Optional note…"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                            />
                        </motion.div>
                    )}

                    {attendChoice !== null && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleSubmit}
                            disabled={submitting || !canSubmit}
                            className="w-full py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: bridal ? "#ec4899" : NAVY, color: IVORY }}
                        >
                            {submitting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : bridal ? (
                                <><Sparkles size={14} /> Confirm</>
                            ) : (
                                "Confirm"
                            )}
                        </motion.button>
                    )}

                    {/* Always-visible contact line */}
                    <p className="text-center text-xs mt-8" style={{ color: `${NAVY}55` }}>
                        Questions? Reach out to us anytime — we're happy to help.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function SaveTheDatePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: APRICOT }} />
                </div>
            }
        >
            <SaveTheDateContent />
        </Suspense>
    );
}