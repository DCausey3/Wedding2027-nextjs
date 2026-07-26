"use client";

import { ExternalLink, Gift, Plane, Home, Heart, Sparkles, PartyPopper, Send } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/ui/SectionHeader";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";
const GREENERY = "#7FAA6E";

const REGISTRIES = [
    { store: "Williams-Sonoma", category: "Kitchen & Entertaining", desc: "We love to cook together — help us fill our kitchen with the tools to keep making memories.", url: "https://www.williams-sonoma.com/registry/kmfrskv6lz/registry-list.html", icon: Home, color: SKY_MID, featured: true },
    { store: "Amazon", category: "Everyday Essentials", desc: "Everything else on our list, from small home essentials to a few fun extras.", url: "https://www.amazon.com/wedding/guest-view/1MMDQ63OJ0LY", icon: Gift, color: SKY, featured: true },
];

// TODO: drop in your real Honeyfund URL once it's set up.
const HONEYFUND_URL = "#";

// TODO: if you decide to offer Zelle as a no-fee alternative, fill these in
// and set SHOW_ZELLE to true. Leave false to hide the card entirely.
const SHOW_ZELLE = false;
const ZELLE_HANDLE = "your-email@example.com or (555) 000-0000";

export default function RegistryPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Hero */}
            <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden" style={{ backgroundColor: SKY_DEEP }}>
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `radial-gradient(circle at 20% 40%, ${APRICOT} 0%, transparent 50%), radial-gradient(circle at 80% 60%, ${SKY} 0%, transparent 50%)` }}
                />
                <div className="relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="uppercase tracking-widest mb-4 flex items-center justify-center gap-2"
                        style={{ color: APRICOT, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                    >
                        <Sparkles size={12} /> You're Spoiling Us Already
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="heading-display"
                        style={{ color: IVORY }}
                    >
                        Registry &amp; <span className="italic" style={{ color: APRICOT }}>Gifts</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mt-4 text-sm max-w-md mx-auto"
                        style={{ color: "rgba(255,247,236,0.7)" }}
                    >
                        Honestly? Just showing up is the gift. But if you're the type who can't come empty-handed
                        (we see you, and we love you for it), here's everything you need.
                    </motion.p>
                </div>
            </div>

            {/* Quote */}
            <section className="py-14 px-6 text-center" style={{ backgroundColor: IVORY }}>
                <div className="flex items-center justify-center gap-4 mb-5" aria-hidden="true">
                    <div className="h-px w-10" style={{ backgroundColor: SAND }} />
                    <Heart size={13} style={{ color: APRICOT, fill: APRICOT }} />
                    <div className="h-px w-10" style={{ backgroundColor: SAND }} />
                </div>
                <blockquote
                    className="font-serif italic text-xl md:text-2xl font-light max-w-xl mx-auto leading-relaxed"
                    style={{ color: SKY_DEEP }}
                >
                    &ldquo;We are already so full of gratitude just knowing you&apos;ll be celebrating with us.&rdquo;
                </blockquote>
                <p className="mt-4 text-sm" style={{ color: `${SKY_DEEP}66` }}>— Jhoana &amp; Damariel</p>
            </section>

            {/* Honeymoon Fund — spotlight card, separate from the "stuff" registries */}
            <section className="px-6 pb-4">
                <div className="container-wedding mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-center"
                        style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-25"
                            style={{ backgroundImage: `radial-gradient(circle at 15% 30%, ${APRICOT} 0%, transparent 45%), radial-gradient(circle at 85% 70%, ${SKY} 0%, transparent 45%)` }}
                        />
                        <div className="relative z-10">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                style={{ backgroundColor: APRICOT }}
                            >
                                <Plane size={24} style={{ color: SKY_DEEP }} />
                            </div>
                            <p className="uppercase tracking-widest mb-3" style={{ color: APRICOT, fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                                Where We'd Rather Spend It
                            </p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 300, color: IVORY, lineHeight: 1.15 }}>
                                Send us on our <span className="italic" style={{ color: APRICOT }}>honeymoon</span>
                            </h2>
                            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ color: "rgba(255,247,236,0.7)" }}>
                                Skip the toaster — help us fund sunsets, questionable amounts of local food, and at least
                                one activity we'll definitely regret two days later.
                            </p>
                            <a
                                href={HONEYFUND_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-7 px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                                style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: "0.18em" }}
                            >
                                <PartyPopper size={14} />
                                Contribute on Honeyfund
                            </a>

                            {SHOW_ZELLE && (
                                <p className="mt-5 text-xs" style={{ color: "rgba(255,247,236,0.55)" }}>
                                    Prefer no platform fees? You can also send directly via Zelle to{" "}
                                    <span style={{ color: APRICOT }}>{ZELLE_HANDLE}</span>.
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Registry cards — the "stuff" registries */}
            <section className="section-pad" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="container-wedding mx-auto">
                    <SectionHeader overline="If You'd Rather Wrap Something" title="Our" titleItalic="Registries" className="mb-12" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        {REGISTRIES.map((r, i) => (
                            <motion.a
                                key={r.store}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card-wedding group block focus-visible:outline-2 focus-visible:outline-offset-2"
                                style={{
                                    border: r.featured ? `2px solid ${r.color}` : undefined,
                                    backgroundColor: IVORY,
                                    outlineColor: SKY,
                                }}
                                aria-label={`${r.store} Registry — opens in new tab`}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: r.color }}>
                                    <r.icon size={20} style={{ color: IVORY }} />
                                </div>
                                <p className="label-overline mb-1" style={{ color: `${SKY_DEEP}66` }}>{r.category}</p>
                                <h3 className="font-serif text-xl font-normal mb-2" style={{ color: SKY_DEEP }}>{r.store}</h3>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: `${SKY_DEEP}99` }}>{r.desc}</p>
                                <span className="flex items-center gap-1 text-xs uppercase tracking-widest transition-opacity group-hover:opacity-70" style={{ color: r.color }}>
                                    View Registry <ExternalLink size={11} />
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="section-pad" style={{ backgroundColor: IVORY }}>
                <div className="container-wedding mx-auto">
                    <SectionHeader overline="Good to Know" title="Gift" titleItalic="Tips" className="mb-10" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        {[
                            { icon: Gift, title: "No gifts at the venue", body: "Please don't bring physical gifts to either wedding — travel light and enjoy the celebration!" },
                            { icon: Send, title: "Ship to our home", body: "All registry gifts can be shipped directly to us. Our address is provided at checkout on each registry." },
                            { icon: Heart, title: "Cards are welcome", body: "A handwritten note means more than any gift. There will be a card box at both venues." },
                        ].map((tip, i) => (
                            <motion.div
                                key={tip.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card-wedding"
                                style={{ backgroundColor: IVORY }}
                            >
                                <tip.icon size={20} className="mb-3" style={{ color: APRICOT }} />
                                <h3 className="font-serif text-lg font-normal mb-1" style={{ color: SKY_DEEP }}>{tip.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: `${SKY_DEEP}99` }}>{tip.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}