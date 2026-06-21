"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart, Loader2, CheckCircle, Calendar, Sparkles, Bell, Gift, Mail, Phone as PhoneIcon,
} from "lucide-react";

const GOLD = "#d4a574";
const DARK = "#1a1209";
const IVORY = "#fdf8f0";
const CHAMP = "#f5ede0";
const TEAL = "#0d9488";
const EMERALD = "#059669";

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
        const colors = [GOLD, "#f5e6c8", "#fff", TEAL, EMERALD];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 60 }), 300);
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 120 }), 400);
    }).catch(() => {});
}

const WEDDING_INFO: Record<string, { label: string; date: string; place: string; color: string }> = {
    Colombia: { label: "Colombia Wedding", date: "November 7, 2026", place: "Pereira, Colombia", color: TEAL },
    USA: { label: "Florida Wedding", date: "December 12, 2026", place: "Miami, Florida", color: EMERALD },
};

function SaveTheDateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestId = searchParams.get("guest");

    const [guest, setGuest] = useState<Guest | null>(null);
    const [loadError, setLoadError] = useState("");
    const [attending, setAttending] = useState<boolean | null>(null);
    const [headcount, setHeadcount] = useState(1);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [smsConsent, setSmsConsent] = useState(false);
    const [declineNote, setDeclineNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const confettiFired = useRef(false);
    const bridal = guest ? isBridalParty(guest) : false;

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.id === guestId) {
                    setGuest(parsed);
                    setHeadcount(Math.min(parsed.plusOneCount ?? 1, maxAllowed));
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

    const isColombiaDecline =
        attending === false && !bridal && (guest?.selectedWedding === "Colombia" || guest?.selectedWedding === "Both");

    const canSubmit =
        attending !== null &&
        (!attending || (phone.trim() && email.trim()));

    const handleSubmit = async () => {
        if (!canSubmit || !guest) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/std-rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: guest.id,
                    attending,
                    headcount: attending ? headcount : 0,
                    phone: attending ? phone : undefined,
                    email: attending ? email : undefined,
                    smsConsent: attending ? smsConsent : false,
                    declineNote: isColombiaDecline ? declineNote : undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Submission failed");

            sessionStorage.setItem("guest", JSON.stringify({ ...guest, stdResponded: true }));

            if (attending) fireConfetti();
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
                <div className="rounded-2xl p-8 text-center max-w-sm" style={{ backgroundColor: "#fff", border: `1px solid ${CHAMP}` }}>
                    <p className="text-sm" style={{ color: `${DARK}99` }}>{loadError}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="mt-5 px-7 py-3 rounded-full text-xs uppercase tracking-[0.15em]"
                        style={{ backgroundColor: GOLD, color: "#fff" }}
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
                <Loader2 size={24} className="animate-spin" style={{ color: GOLD }} />
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
                    style={{ backgroundColor: "#fff", border: `1px solid ${CHAMP}` }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: attending ? `radial-gradient(circle at 38% 38%, ${GOLD}, #b8926a)` : "#f5ede0" }}
                    >
                        {attending ? <CheckCircle size={28} style={{ color: "#fff" }} /> : <span className="text-2xl">🌸</span>}
                    </motion.div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.9rem", fontWeight: 300, color: DARK }}>
                        {attending ? "Thank you, we can't wait!" : "We'll miss you"}
                    </h2>
                    {!attending && (
                        <div className="mt-4 flex items-start gap-2.5 text-left p-4 rounded-xl" style={{ backgroundColor: CHAMP }}>
                            <Gift size={15} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-xs leading-relaxed" style={{ color: `${DARK}68` }}>
                                You're always welcome to return to this site if you'd like to send a gift from our registry.
                            </p>
                        </div>
                    )}
                    <p className="mt-4 text-sm" style={{ color: `${DARK}66` }}>Taking you to the homepage…</p>
                </motion.div>
            </div>
        );
    }

    const maxHeadcount = guest.plusOneCount ?? 1;
    const weddingKeys = guest.selectedWedding === "Both" ? ["Colombia", "USA"] : guest.selectedWedding ? [guest.selectedWedding] : [];

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-20 pb-20">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                    {/* Cinematic hero */}
                    <div
                        className="relative rounded-2xl overflow-hidden mb-7 p-7 sm:p-9"
                        style={{ background: `linear-gradient(140deg, ${DARK} 0%, #2d1f0e 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.12]"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 50%, ${GOLD}, transparent 50%), radial-gradient(circle at 80% 30%, ${bridal ? "#ec4899" : TEAL}, transparent 50%)`,
                            }}
                        />
                        <div className="relative z-10">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[0.58rem] uppercase tracking-[0.3em] mb-4"
                                style={{ color: bridal ? "#f9a8d4" : GOLD }}
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
                                style={{ color: "rgba(253,248,240,0.72)" }}
                            >
                                {bridal
                                    ? "We are so glad to have you as part of the bridal party. We're having two weddings and would love to have you at both — if you can't make one, just let us know which you'll be able to attend."
                                    : "Jhoana and Damariel are so excited to celebrate with you. Please confirm whether you'll be able to join us."}
                            </motion.p>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-xs italic" style={{ color: GOLD }}>
                                — Jhoana &amp; Damariel
                            </motion.p>
                        </div>
                    </div>

                    {/* Wedding date cards */}
                    <div className="space-y-2.5 mb-5">
                        {weddingKeys.map((key) => {
                            const info = WEDDING_INFO[key];
                            if (!info) return null;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-4 p-4 rounded-xl"
                                    style={{ backgroundColor: `${info.color}0e`, border: `1px solid ${info.color}22` }}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: info.color }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.6rem", color: IVORY }}>
                      {key === "Colombia" ? "COL" : "USA"}
                    </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium" style={{ color: info.color }}>{info.label}</p>
                                        <p className="text-sm" style={{ color: DARK }}>{info.date} · {info.place}</p>
                                    </div>
                                    <Calendar size={13} style={{ color: `${DARK}28` }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Intimate guest list disclaimer */}
                    <div className="rounded-xl p-4 mb-7 flex items-start gap-2.5" style={{ backgroundColor: `${DARK}05`, border: `1px solid ${DARK}08` }}>
                        <Heart size={13} style={{ color: `${DARK}38`, marginTop: 2, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed" style={{ color: `${DARK}55` }}>
                            This will be an intimate celebration with family and close friends only. If there's someone in your
                            party who isn't reflected here, we sincerely apologize and hope you understand.
                        </p>
                    </div>

                    {/* Attendance */}
                    <div className="space-y-3 mb-6">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setAttending(true)}
                            className="w-full rounded-2xl p-5 text-left transition-all"
                            style={{
                                border: `2px solid ${attending === true ? GOLD : `${DARK}10`}`,
                                backgroundColor: attending === true ? `${GOLD}0f` : "#fff",
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">🎉</span>
                                <div>
                                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: DARK }}>
                                        Joyfully Accepts
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: `${DARK}58` }}>We'll be there to celebrate!</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setAttending(false)}
                            className="w-full rounded-2xl p-5 text-left transition-all"
                            style={{
                                border: `2px solid ${attending === false ? "#8a7a65" : `${DARK}10`}`,
                                backgroundColor: attending === false ? "#f5ede080" : "#fff",
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">🌸</span>
                                <div>
                                    <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: DARK }}>
                                        Declines with Regret
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: `${DARK}58` }}>We'll miss you, but understand.</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Headcount — only on accept */}
                    {attending === true && maxHeadcount > 1 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${CHAMP}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em] mb-2" style={{ color: `${DARK}48` }}>
                                You're set for {maxHeadcount} {maxHeadcount === 1 ? "guest" : "guests"}
                            </p>
                            <p className="text-xs mb-3" style={{ color: `${DARK}52` }}>
                                If your actual count is lower, please update it below.
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
                                style={{ backgroundColor: CHAMP, border: "1.5px solid transparent", color: DARK }}
                            />
                        </motion.div>
                    )}

                    {/* Contact info — required on accept */}
                    {attending === true && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5 space-y-4" style={{ backgroundColor: "#fff", border: `1px solid ${CHAMP}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: `${DARK}48` }}>
                                Stay in the loop
                            </p>
                            <p className="text-xs -mt-2" style={{ color: `${DARK}52` }}>
                                We'll keep you updated as the wedding gets closer.
                            </p>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${DARK}48` }}>
                                    <Mail size={11} style={{ color: GOLD }} /> Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: CHAMP, border: "1.5px solid transparent", color: DARK }}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${DARK}48` }}>
                                    <PhoneIcon size={11} style={{ color: GOLD }} /> Phone
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: CHAMP, border: "1.5px solid transparent", color: DARK }}
                                />
                            </div>

                            {/* SMS consent toggle */}
                            <div className="flex items-start justify-between gap-4 pt-2 border-t" style={{ borderColor: CHAMP }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}14` }}>
                                        <Bell size={14} style={{ color: GOLD }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: DARK }}>Text Message Updates</p>
                                        <p className="text-[0.65rem] mt-0.5" style={{ color: `${DARK}52` }}>Optional reminders by text</p>
                                    </div>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={smsConsent}
                                    onClick={() => setSmsConsent(!smsConsent)}
                                    className="flex-shrink-0 w-10 h-6 rounded-full relative transition-colors mt-0.5"
                                    style={{ backgroundColor: smsConsent ? GOLD : "#c4b49e" }}
                                >
                                    <motion.div
                                        animate={{ x: smsConsent ? 18 : 2 }}
                                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>
                            {smsConsent && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[0.58rem] leading-relaxed" style={{ color: `${DARK}42` }}>
                                    By enabling, you consent to receive text messages about the wedding. Msg &amp; data rates may apply. Reply STOP to opt out anytime.
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                    {/* Decline reason — Colombia decline only, non-bridal-party */}
                    {isColombiaDecline && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${CHAMP}` }}>
                            <label className="text-[0.6rem] uppercase tracking-[0.18em] mb-2 block" style={{ color: `${DARK}48` }}>
                                Help us understand (optional)
                            </label>
                            <p className="text-xs mb-3" style={{ color: `${DARK}52` }}>
                                If there's a reason you're unable to join — travel, health, or otherwise — feel free to share. It helps us plan.
                            </p>
                            <textarea
                                rows={3}
                                value={declineNote}
                                onChange={(e) => setDeclineNote(e.target.value)}
                                placeholder="Optional note…"
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{ backgroundColor: CHAMP, border: "1.5px solid transparent", color: DARK }}
                            />
                        </motion.div>
                    )}

                    {attending !== null && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleSubmit}
                            disabled={submitting || !canSubmit}
                            className="w-full py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: bridal ? "#ec4899" : DARK, color: IVORY }}
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
                    <Loader2 size={24} className="animate-spin" style={{ color: GOLD }} />
                </div>
            }
        >
            <SaveTheDateContent />
        </Suspense>
    );
}