"use client";

import { ExternalLink, Gift, Send, Home, Heart, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HoneymoonFund } from "@/components/wedding/HoneymoonFund";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";

const REGISTRIES = [
    { store: "Williams-Sonoma", category: "Kitchen & Entertaining", desc: "We love to cook together — help us fill our kitchen with the tools to keep making memories.", url: "https://www.williams-sonoma.com/registry/kmfrskv6lz/registry-list.html", icon: Home, color: SKY_MID, featured: true },
    { store: "Amazon", category: "Everyday Essentials", desc: "Everything else on our list, from small home essentials to a few fun extras.", url: "https://www.amazon.com/wedding/guest-view/1MMDQ63OJ0LY", icon: Gift, color: SKY, featured: true },
];

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

            {/* Honeymoon Fund — built into the site, Stripe-powered */}
            <HoneymoonFund />

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