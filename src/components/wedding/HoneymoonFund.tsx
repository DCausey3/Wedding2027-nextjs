"use client";

import { Plane, UtensilsCrossed, Compass, Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const GREENERY = "#7FAA6E";

/**
 * HOW TO WIRE THIS UP (no backend required):
 * 1. In your Stripe Dashboard → Payment Links, create one Payment Link per
 *    experience below (or one flexible "customer chooses amount" link for
 *    "Buy Us a Round" style flexible giving).
 * 2. Paste each resulting URL (looks like https://buy.stripe.com/xxxxx)
 *    into the `stripeLink` field for that experience.
 * 3. That's it — no API route, no webhook needed for a simple "collect money"
 *    flow. Stripe hosts the actual checkout page.
 *
 * If you later want custom amounts entered inline on THIS page (rather than
 * guests picking a link), that requires a small API route using the Stripe
 * SDK to create a Checkout Session server-side — happy to build that when
 * you're ready to wire in your Stripe account.
 */
const EXPERIENCES = [
    {
        key: "dinner",
        icon: UtensilsCrossed,
        title: "A Night of Tapas",
        amount: "$50",
        desc: "Buy us a proper dinner out — the kind with too many small plates and one too many glasses of wine.",
        color: SKY,
        stripeLink: "#", // TODO: paste Stripe Payment Link
    },
    {
        key: "excursion",
        icon: Compass,
        title: "A Day We'll Never Forget",
        amount: "$150",
        desc: "Help fund an excursion — a boat day, a hike, a tour we'd never book for ourselves but always remember.",
        color: GREENERY,
        stripeLink: "#", // TODO: paste Stripe Payment Link
    },
    {
        key: "flight",
        icon: Plane,
        title: "Get Us There",
        amount: "$400",
        desc: "Chip in toward flights so we can actually get to wherever we're headed for our honeymoon.",
        color: APRICOT,
        stripeLink: "#", // TODO: paste Stripe Payment Link
    },
];

// A flexible "any amount" option — point this at a Stripe Payment Link
// configured to let the customer enter their own amount.
const FLEXIBLE_LINK = "#"; // TODO: paste Stripe Payment Link (customer-chooses-amount)

export function HoneymoonFund() {
    return (
        <section className="px-6 py-4">
            <div className="container-wedding mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center mb-10"
                    style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}
                >
                    <div
                        className="absolute inset-0 opacity-25"
                        style={{ backgroundImage: `radial-gradient(circle at 15% 30%, ${APRICOT} 0%, transparent 45%), radial-gradient(circle at 85% 70%, ${SKY} 0%, transparent 45%)` }}
                    />
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: APRICOT }}>
                            <Plane size={24} style={{ color: SKY_DEEP }} />
                        </div>
                        <p className="uppercase tracking-widest mb-3 flex items-center justify-center gap-2" style={{ color: APRICOT, fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                            <Sparkles size={11} /> Where We'd Rather Spend It
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 300, color: IVORY, lineHeight: 1.15 }}>
                            Send us on our <span className="italic" style={{ color: APRICOT }}>honeymoon</span>
                        </h2>
                        <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(255,247,236,0.7)" }}>
                            Skip the toaster — pick an experience below, or just send whatever feels right.
                        </p>
                    </div>
                </motion.div>

                {/* Experience tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {EXPERIENCES.map((exp, i) => (
                        <motion.a
                            key={exp.key}
                            href={exp.stripeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="card-wedding group block text-center focus-visible:outline-2 focus-visible:outline-offset-2"
                            style={{ backgroundColor: IVORY, outlineColor: SKY }}
                            aria-label={`Contribute ${exp.amount} toward: ${exp.title}`}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: exp.color }}
                            >
                                <exp.icon size={20} style={{ color: SKY_DEEP }} />
                            </div>
                            <p
                                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 400, color: SKY_DEEP }}
                            >
                                {exp.amount}
                            </p>
                            <h3 className="font-serif text-base font-normal mt-1 mb-2" style={{ color: SKY_DEEP }}>{exp.title}</h3>
                            <p className="text-xs leading-relaxed mb-4" style={{ color: `${SKY_DEEP}99` }}>{exp.desc}</p>
                            <span
                                className="inline-block px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-opacity group-hover:opacity-85"
                                style={{ backgroundColor: exp.color, color: SKY_DEEP, letterSpacing: "0.12em" }}
                            >
                                Contribute
                            </span>
                        </motion.a>
                    ))}
                </div>

                {/* Flexible / any-amount option */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center"
                >
                    <p className="text-sm mb-3" style={{ color: `${SKY_DEEP}80` }}>
                        Prefer to give a different amount?
                    </p>
                    <a
                        href={FLEXIBLE_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: "0.18em" }}
                    >
                        <Heart size={13} style={{ fill: APRICOT, color: APRICOT }} />
                        Give Any Amount
                    </a>
                </motion.div>
            </div>
        </section>
    );
}