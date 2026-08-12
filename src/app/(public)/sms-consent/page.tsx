"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

// Palette — matches main site
const NAVY = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";

// Static, publicly viewable replica of the SMS consent section from the
// gated RSVP flow. This page exists solely so carriers / The Campaign
// Registry can verify the opt-in mechanism and required disclosures
// without needing an invite code. It is not a functional form — no data
// submitted here is stored or sent anywhere.
export default function SmsConsentPreviewPage() {
    const [smsConsent, setSmsConsent] = useState(false);

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-16 pb-20">
                <h1
                    style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: "1.9rem",
                        fontWeight: 300,
                        color: NAVY,
                    }}
                >
                    SMS Consent — Preview
                </h1>
                <p className="text-xs leading-relaxed mt-3 mb-8" style={{ color: `${NAVY}80` }}>
                    Our full RSVP form is only accessible to invited guests via a unique
                    access code, since this is a private guest list rather than a
                    public-facing service. This page reproduces the exact SMS opt-in
                    section from that form — including the consent toggle and required
                    disclosures — so the opt-in mechanism can be reviewed without an
                    invite code. This preview is not connected to our database; nothing
                    submitted here is stored or transmitted.
                </p>

                <div
                    className="rounded-2xl p-5 space-y-4"
                    style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
                >
                    <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: `${NAVY}60` }}>
                        Stay in the loop
                    </p>
                    <p className="text-xs -mt-2" style={{ color: `${NAVY}70` }}>
                        We&apos;ll keep you updated as the wedding gets closer.
                    </p>

                    <div className="flex items-start justify-between gap-4 pt-2 border-t" style={{ borderColor: SAND }}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${APRICOT}22` }}
                            >
                                <Bell size={14} style={{ color: APRICOT }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: NAVY }}>
                                    Text Message Updates
                                </p>
                                <p className="text-[0.65rem] mt-0.5" style={{ color: `${NAVY}60` }}>
                                    Optional reminders by text
                                </p>
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

                    {/* Disclosure is always visible next to the toggle, regardless of
                        its current state — not gated behind opting in. */}
                    <p className="text-[0.58rem] leading-relaxed" style={{ color: `${NAVY}50` }}>
                        By enabling, you agree to receive text messages from Causey/Cardenas
                        Wedding, including save-the-date announcements, RSVP reminders, and
                        travel updates. Message frequency varies (approx. 2–5 messages). Msg
                        &amp; data rates may apply. Reply STOP to cancel, HELP for help.
                    </p>
                </div>

                <p className="text-xs leading-relaxed mt-8" style={{ color: `${NAVY}60` }}>
                    Enabling SMS updates is entirely optional and is never required to
                    complete an RSVP. See our{" "}
                    <a href="/terms" className="underline" style={{ color: NAVY }}>
                        Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="underline" style={{ color: NAVY }}>
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}