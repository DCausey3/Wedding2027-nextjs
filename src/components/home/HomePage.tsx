"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, MapPin, Calendar } from "lucide-react";
import { CountdownTimer } from "../../components/ui/CountdownTimer";
import { WEDDING_DATES } from "../../lib/utils";

// ─── Personalized welcome banner ──────────────────────────────────────────────
// Reads the guest set in sessionStorage by the login/save-the-date flow.
// No persistent session — only shows if they arrived here in the same browser tab.
function WelcomeBanner() {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.firstName) setName(parsed.firstName);
            } catch {
                // ignore malformed storage
            }
        }
    }, []);

    if (!name) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 w-full py-3 px-6 text-center"
            style={{ backgroundColor: "#1a1209", borderBottom: "1px solid rgba(212,165,116,0.25)" }}
        >
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "#f5e6c8" }}>
                Welcome back, {name}! We&apos;re so glad you&apos;re here.
            </p>
        </motion.div>
    );
}

// ─── Hero with parallax ────────────────────────────────────────────────────────
function HeroSection() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div ref={ref} className="relative h-screen min-h-[680px] flex items-center justify-center overflow-hidden">
            <motion.div className="absolute inset-0 overflow-hidden" style={{ y }}>
                <Image
                    src="/IMG_2961.JPG"
                    alt="Jhoana & Damariel engagement"
                    fill
                    priority
                    className="object-cover"
                    style={{ objectPosition: "center 20%" }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(10,7,3,0.35) 0%, rgba(10,7,3,0.15) 40%, rgba(10,7,3,0.6) 100%)",
                    }}
                />
            </motion.div>

            <motion.div style={{ opacity }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="uppercase tracking-widest mb-6"
                    style={{ color: "#f5e6c8", fontSize: "0.65rem", letterSpacing: "0.3em" }}
                >
                    We&apos;re getting married
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(3.5rem, 10vw, 7rem)",
                        fontWeight: 300,
                        color: "#fdf8f0",
                        lineHeight: 1.05,
                        letterSpacing: "-0.01em",
                    }}
                >
                    Jhoana
                    <br />
                    <span style={{ fontStyle: "italic", color: "#f5e6c8" }}>&amp; Damariel</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="my-8 flex items-center gap-4"
                >
                    <div className="h-px w-12" style={{ backgroundColor: "#d4a574" }} />
                    <p className="uppercase tracking-widest" style={{ color: "#f5e6c8", fontSize: "0.65rem", letterSpacing: "0.25em" }}>
                        Two Celebrations, One Love Story
                    </p>
                    <div className="h-px w-12" style={{ backgroundColor: "#d4a574" }} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                    className="mb-10"
                >
                    <CountdownTimer
                        targetDate={WEDDING_DATES.colombia}
                        label="Colombia — Nov 7, 2026"
                        textColor="#fdf8f0"
                        accentColor="#d4a574"
                        size="lg"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link
                        href="/login"
                        className="px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                        style={{ backgroundColor: "#d4a574", color: "#fff", letterSpacing: "0.2em" }}
                    >
                        View Invitation
                    </Link>
                    <Link
                        href="/login"
                        className="px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all hover:bg-white/10"
                        style={{ border: "1px solid rgba(253,248,240,0.6)", color: "#fdf8f0", letterSpacing: "0.2em" }}
                    >
                        Guest Login
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                    <ArrowDown size={16} style={{ color: "#d4a574" }} />
                </motion.div>
            </motion.div>
        </div>
    );
}

// ─── Wedding destination card ──────────────────────────────────────────────────
function WeddingCard({
                         title, date, location, image, accentColor, bgGradient, linkTo, delay = 0,
                     }: {
    title: string; date: string; location: string; image: string;
    accentColor: string; bgGradient: string; linkTo: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay }}
            whileHover={{ y: -6 }}
            className="relative overflow-hidden rounded-2xl group"
            style={{ aspectRatio: "3/4" }}
        >
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0" style={{ background: bgGradient }} />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
                <p className="uppercase tracking-widest mb-2" style={{ color: accentColor, fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                    {date}
                </p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#fdf8f0", lineHeight: 1.1 }}>
                    {title}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                    <MapPin size={12} style={{ color: accentColor }} />
                    <p className="text-xs" style={{ color: "rgba(253,248,240,0.7)" }}>{location}</p>
                </div>
                <Link
                    href={linkTo}
                    className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: "#fdf8f0", letterSpacing: "0.15em" }}
                >
                    Explore
                    <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Our Story ─────────────────────────────────────────────────────────────────
function OurStorySection() {
    return (
        <section id="story" className="py-28 px-6" style={{ backgroundColor: "#fdf8f0" }}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="uppercase tracking-widest mb-4" style={{ color: "#d4a574", fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                        Our Journey
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: "#1a1209", lineHeight: 1.1 }}>
                        The Story So Far
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] overflow-hidden rounded-2xl relative">
                            <Image
                                src="/IMG_2958.JPG"
                                alt="The proposal"
                                fill
                                className="object-cover"
                                style={{ objectPosition: "center 30%" }}
                            />
                        </div>
                        <div className="absolute -bottom-4 -right-4 rounded-xl px-6 py-4" style={{ backgroundColor: "#d4a574", color: "#fff" }}>
                            <p className="uppercase tracking-widest" style={{ fontSize: "0.55rem", letterSpacing: "0.2em" }}>The Proposal</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400 }}>Summer 2024</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="flex flex-col gap-6"
                    >
                        <p className="uppercase tracking-widest" style={{ color: "#d4a574", fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                            Chapter One
                        </p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.25rem", fontWeight: 300, color: "#1a1209", lineHeight: 1.15 }}>
                            He got down on one knee
                        </h3>
                        <p className="leading-relaxed" style={{ color: "#5a4a35", fontSize: "0.95rem" }}>
                            On a warm summer afternoon in a beautiful garden, surrounded by blooming flowers and the gentle rustling of leaves, Damariel asked Jhoana to be his forever. With trembling hands and happy tears, she said yes.
                        </p>
                        <p className="leading-relaxed" style={{ color: "#5a4a35", fontSize: "0.95rem" }}>
                            Their love story spans two continents — rooted in the warmth of Colombia and flourishing in the sunshine of Florida. Now they&apos;re ready to celebrate with everyone they love, twice over.
                        </p>
                        <div className="h-px" style={{ backgroundColor: "#e8dcc8" }} />
                        <div className="flex gap-8">
                            {[["2", "Weddings"], ["2", "Countries"], ["∞", "Love"]].map(([num, label]) => (
                                <div key={label}>
                                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#d4a574", fontWeight: 300 }}>{num}</p>
                                    <p className="uppercase tracking-widest" style={{ fontSize: "0.55rem", color: "#8a7a65", letterSpacing: "0.15em" }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="col-span-7 aspect-[16/9] overflow-hidden rounded-xl relative"
                    >
                        <Image
                            src="/IMG_2960.JPG"
                            alt="Happy together"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                            style={{ objectPosition: "center 20%" }}
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="col-span-5 aspect-[4/3] overflow-hidden rounded-xl relative"
                    >
                        <Image
                            src="/IMG_2962.JPG"
                            alt="The ring"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── Weddings ──────────────────────────────────────────────────────────────────
function WeddingsSection() {
    return (
        <section className="py-24 px-6" style={{ backgroundColor: "#f5ede0" }}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="uppercase tracking-widest mb-4" style={{ color: "#d4a574", fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                        Two Celebrations
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: "#1a1209", lineHeight: 1.1 }}>
                        Choose Your Adventure
                    </h2>
                    <p className="mt-4 max-w-md mx-auto" style={{ color: "#5a4a35", fontSize: "0.9rem" }}>
                        Two weddings, two countries, one unforgettable love story. We can&apos;t wait to celebrate with you.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <WeddingCard
                        title="Colombia Wedding"
                        date="November 7, 2026"
                        location="Pereira, Colombia"
                        image="https://images.unsplash.com/photo-1643068730310-e8cff093b7ab?w=1080&q=80"
                        accentColor="#2dd4bf"
                        bgGradient="linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)"
                        linkTo="/colombia"
                        delay={0.1}
                    />
                    <WeddingCard
                        title="Florida Wedding"
                        date="December 12, 2026"
                        location="Miami, Florida"
                        image="https://images.unsplash.com/photo-1719008682128-5ebdbc7ccfab?w=1080&q=80"
                        accentColor="#34d399"
                        bgGradient="linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)"
                        linkTo="/florida"
                        delay={0.25}
                    />
                </div>
            </div>
        </section>
    );
}

// ─── Countdown strip ───────────────────────────────────────────────────────────
function CountdownSection() {
    return (
        <section className="py-20 px-6" style={{ backgroundColor: "#fdf8f0" }}>
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col items-center text-center p-10 rounded-2xl"
                        style={{ backgroundColor: "#f0f9f8", border: "1px solid #99f6e4" }}
                    >
                        <p className="uppercase tracking-widest mb-2" style={{ color: "#0d9488", fontSize: "0.55rem", letterSpacing: "0.25em" }}>
                            Colombia
                        </p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: "#0f766e" }}>
                            Pereira, Colombia
                        </h3>
                        <div className="flex items-center gap-2 mt-2 mb-6">
                            <Calendar size={12} style={{ color: "#0d9488" }} />
                            <p className="text-xs" style={{ color: "#5a4a35" }}>November 7, 2026</p>
                        </div>
                        <CountdownTimer targetDate={WEDDING_DATES.colombia} textColor="#0f766e" accentColor="#0d9488" size="md" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="flex flex-col items-center text-center p-10 rounded-2xl"
                        style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac" }}
                    >
                        <p className="uppercase tracking-widest mb-2" style={{ color: "#059669", fontSize: "0.55rem", letterSpacing: "0.25em" }}>
                            Florida
                        </p>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 400, color: "#065f46" }}>
                            Miami, Florida
                        </h3>
                        <div className="flex items-center gap-2 mt-2 mb-6">
                            <Calendar size={12} style={{ color: "#059669" }} />
                            <p className="text-xs" style={{ color: "#5a4a35" }}>December 12, 2026</p>
                        </div>
                        <CountdownTimer targetDate={WEDDING_DATES.usa} textColor="#065f46" accentColor="#059669" size="md" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ─── RSVP banner ────────────────────────────────────────────────────────────────
function RSVPBannerSection() {
    return (
        <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: "#1a1209" }}>
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 30% 50%, #d4a574 0%, transparent 50%), radial-gradient(circle at 70% 50%, #2dd4bf 0%, transparent 50%)",
                }}
            />
            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="uppercase tracking-widest mb-4" style={{ color: "#d4a574", fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                        You&apos;re Invited
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: "#fdf8f0", lineHeight: 1.05 }}>
                        RSVP by
                        <span style={{ fontStyle: "italic", color: "#d4a574" }}> September 1st</span>
                    </h2>
                    <p className="mt-6 mb-10" style={{ color: "rgba(253,248,240,0.65)", fontSize: "0.9rem" }}>
                        Please let us know if you&apos;ll be joining us in Colombia, Florida, or both! We want to make sure everything is perfect for your experience.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-10 py-4 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                        style={{ backgroundColor: "#d4a574", color: "#fff", letterSpacing: "0.2em" }}
                    >
                        RSVP Now
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <>
            <WelcomeBanner />
            <HeroSection />
            <OurStorySection />
            <WeddingsSection />
            <CountdownSection />
            <RSVPBannerSection />
        </>
    );
}