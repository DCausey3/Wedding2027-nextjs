"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Loader2, CheckCircle } from "lucide-react";

type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    selectedWedding: "colombia" | "florida" | "both" | null;
    plusOneCount: number | null;
    plusOneAllowed: boolean | null;
};

const WEDDING_LABEL: Record<string, string> = {
    colombia: "the Colombia wedding (Nov 7, 2026)",
    florida: "the Florida wedding (Dec 12, 2026)",
    both: "both the Colombia and Florida weddings",
};

function SaveTheDateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestId = searchParams.get("guest");

    const [guest, setGuest] = useState<Guest | null>(null);
    const [loadError, setLoadError] = useState("");
    const [attending, setAttending] = useState<boolean | null>(null);
    const [headcount, setHeadcount] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    // Load the guest — must come from sessionStorage (set by the login page).
    // This page only works as part of the login → save-the-date flow.
    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.id === guestId) {
                    setGuest(parsed);
                    setHeadcount(parsed.plusOneCount ?? 1);
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

    const handleSubmit = async () => {
        if (attending === null || !guest) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/std-rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: guest.id,
                    attending,
                    headcount: attending ? headcount : 0,
                }),
            });
            if (!res.ok) throw new Error("Submission failed");

            // Update sessionStorage so downstream pages reflect the new status
            sessionStorage.setItem(
                "guest",
                JSON.stringify({ ...guest, stdResponded: true })
            );

            setDone(true);
            setTimeout(() => router.push(`/?guest=${guest.id}`), 1800);
        } catch {
            alert("Something went wrong saving your response. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#fdf8f0" }}>
                <div className="card-wedding text-center max-w-sm">
                    <p className="text-sm text-dark/60">{loadError}</p>
                    <button onClick={() => router.push("/login")} className="btn-gold mt-4">
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdf8f0" }}>
                <Loader2 size={24} className="animate-spin text-sand" />
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#fdf8f0" }}>
                <div className="card-wedding flex flex-col items-center text-center gap-4 py-12 max-w-sm">
                    <CheckCircle size={36} className="text-sand" />
                    <h2 className="font-serif text-2xl font-light text-dark">Thank you!</h2>
                    <p className="text-sm text-dark/60">Taking you to the homepage…</p>
                </div>
            </div>
        );
    }

    const maxHeadcount = guest.plusOneCount ?? 1;
    const weddingPhrase = guest.selectedWedding ? WEDDING_LABEL[guest.selectedWedding] : "the wedding";

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-16" style={{ backgroundColor: "#fdf8f0" }}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Heart size={16} style={{ color: "#d4a574", fill: "#d4a574" }} />
                    <span className="uppercase text-xs" style={{ color: "#1a1209", letterSpacing: "0.2em" }}>
            J &amp; D — 2026
          </span>
                </div>

                <div className="card-wedding text-center mb-6">
                    <p className="label-overline text-sand mb-2">Hello, {guest.firstName}!</p>
                    <h1 className="heading-section text-dark mb-3">Save the Date</h1>
                    <p className="text-sm text-dark/60 leading-relaxed">
                        Jhoana and Damariel are so excited for {weddingPhrase} and can&apos;t
                        wait to celebrate with you. Please confirm whether you&apos;ll be
                        able to join us.
                    </p>
                </div>

                <div className="card-wedding space-y-5">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setAttending(true)}
                            className="w-full py-3 rounded-xl text-sm transition-all"
                            style={{
                                backgroundColor: attending === true ? "#1a1209" : "#f5ede0",
                                color: attending === true ? "#fdf8f0" : "#1a1209",
                            }}
                        >
                            🎉 Yes, we&apos;ll be there!
                        </button>
                        <button
                            onClick={() => setAttending(false)}
                            className="w-full py-3 rounded-xl text-sm transition-all"
                            style={{
                                backgroundColor: attending === false ? "#1a1209" : "#f5ede0",
                                color: attending === false ? "#fdf8f0" : "#1a1209",
                            }}
                        >
                            😢 Sorry, can&apos;t make it
                        </button>
                    </div>

                    {attending === true && maxHeadcount > 1 && (
                        <div className="pt-2 border-t border-champagne">
                            <p className="label-overline text-dark/50 mb-2">
                                You&apos;re set for {maxHeadcount} {maxHeadcount === 1 ? "guest" : "guests"}
                            </p>
                            <p className="text-xs text-dark/50 mb-3">
                                If you don&apos;t need all {maxHeadcount} spots, let us know how many will attend.
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
                                className="w-full px-4 py-3 rounded-xl text-sm border border-champagne bg-white text-dark focus:border-sand focus:outline-none"
                            />
                        </div>
                    )}

                    {attending !== null && (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full btn-gold disabled:opacity-40"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Confirm"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SaveTheDatePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fdf8f0" }}>
                    <Loader2 size={24} className="animate-spin text-sand" />
                </div>
            }
        >
            <SaveTheDateContent />
        </Suspense>
    );
}