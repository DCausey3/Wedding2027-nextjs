"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, animate, useInView, useReducedMotion } from 'motion/react';
import { MapPin, Heart, Sparkles, Star } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

// Setup notes
// 1. npm i canvas-confetti && npm i -D @types/canvas-confetti
// 2. Optional handwriting font for polaroid captions: add "Caveat" via next/font/google
//    or a <link>. Falls back to cursive if it isn't loaded.

// Palette — Sky Blue + Apricot + Ivory + Sand
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const APRICOT = "#FFB482";
const PINK = "#ec4899";

const SERIF = "'Cormorant Garamond', serif";
const HAND = "'Caveat', 'Segoe Script', cursive";

interface Member {
    name: string;
    role: string;
    side: 'bride' | 'groom';
    location: string; // "City, State"
    howTheyKnowUs: string;
    photo?: string;       // optional — falls back to initials avatar
    featured?: boolean;   // headliners get the spotlight row
    superlative?: string; // fun "most likely to..." line shown on the back of the card
    funFact?: string;     // optional extra line on the back of the card
    tag?: string;         // small chip, e.g. "Causey Brother #1"
}

// TODO: add `photo: '/bridal-party/name.jpg'` for each person as photos come in.
// TODO: swap the placeholder superlatives and add real funFact lines — these are
// starter ideas so the cards have personality out of the box.
const BRIDAL_PARTY: Member[] = [
    // ---- Jhoana's side ----
    { name: 'Vivi Cardenas', role: 'Matron of Honor', side: 'bride', location: 'Atlanta, Georgia', featured: true,
      howTheyKnowUs: 'Cousin’s wife who became an older sister',
      superlative: 'Most likely to have a tissue ready before you need one' },
    { name: 'Alejandra Cardenas', role: 'Co-Maid of Honor', side: 'bride', location: 'Tampa, Florida', featured: true,
      howTheyKnowUs: 'Twin sister',
      superlative: 'Most likely to finish the bride’s sentences' },
    { name: 'Tori Levy', role: 'Co-Maid of Honor', side: 'bride', location: 'Tampa, Florida', featured: true,
      howTheyKnowUs: 'Childhood best friend of the bride',
      superlative: 'Knows every embarrassing story and promises not to tell' },
    { name: 'Angelica Guinand', role: 'Co-Maid of Honor', side: 'bride', location: 'Tampa, Florida', featured: true,
      howTheyKnowUs: 'Childhood best friend of the bride',
      superlative: 'Most likely to start the dance floor' },
    { name: 'Anabelle Manriquez', role: 'Bridesmaid', side: 'bride', location: 'Tampa, Florida',
      howTheyKnowUs: 'Family friend',
      superlative: 'Most likely to be the calm in the chaos' },
    { name: 'Angelica Peregrino', role: 'Bridesmaid', side: 'bride', location: 'Dallas, Texas',
      howTheyKnowUs: 'Sister-in-law',
      superlative: 'Traveling the farthest with the biggest smile' },
    { name: 'Andrea Figueroa', role: 'Bridesmaid', side: 'bride', location: 'Tampa, Florida',
      howTheyKnowUs: 'Family friend',
      superlative: 'Most likely to organize the group photo' },

    // ---- Damariel's side ----
    { name: 'Steve Atkins', role: 'Co-Best Man', side: 'groom', location: 'Orlando, Florida', featured: true,
      howTheyKnowUs: 'Best friend from high school — we played basketball and baseball together',
      superlative: 'Most likely to give the toast that makes everyone cry-laugh' },
    { name: 'David Green', role: 'Co-Best Man', side: 'groom', location: 'Gainesville, Florida', featured: true,
      howTheyKnowUs: 'Best friend since 2nd grade',
      superlative: 'Has the longest receipts on the groom' },
    { name: 'Ivan Cardenas', role: 'Groomsman', side: 'groom', location: 'Tampa, Florida',
      howTheyKnowUs: 'The bride’s brother who turned into a little brother to the groom',
      superlative: 'Official bridge between both families' },
    // Causey brothers, oldest to youngest
    { name: 'Nick Causey', role: 'Groomsman', side: 'groom', location: 'Pensacola, Florida', tag: 'Causey Brother #1',
      howTheyKnowUs: 'Oldest brother',
      superlative: 'Original big brother energy' },
    { name: 'Brandon Causey', role: 'Groomsman', side: 'groom', location: 'Atlanta, Georgia', tag: 'Causey Brother #2',
      howTheyKnowUs: 'Second oldest brother',
      superlative: 'Most likely to steal the mic' },
    { name: 'Davinus Causey', role: 'Groomsman', side: 'groom', location: 'Tampa, Florida', tag: 'Causey Brother #3',
      howTheyKnowUs: 'Third oldest brother',
      superlative: 'Always first at the food table' },
    { name: 'Damarcus Causey', role: 'Groomsman', side: 'groom', location: 'Dallas, Texas', tag: 'Causey Brother #4',
      howTheyKnowUs: 'Fourth oldest brother',
      superlative: 'Will definitely lead the dance floor' },
];

const ACCENTS = [SKY_DEEP, APRICOT, "#7FAA6E", "#A4D4F4", "#c98a55", "#5FA8D3"];

function roleEmoji(role: string) {
    const r = role.toLowerCase();
    if (r.includes('matron') || r.includes('maid of honor')) return '👑';
    if (r.includes('best man')) return '🎩';
    if (r.includes('bridesmaid')) return '💐';
    if (r.includes('groomsman')) return '🤵';
    return '✨';
}

const brideFeatured = BRIDAL_PARTY.filter((m) => m.side === 'bride' && m.featured);
const brideRest = BRIDAL_PARTY.filter((m) => m.side === 'bride' && !m.featured);
const groomFeatured = BRIDAL_PARTY.filter((m) => m.side === 'groom' && m.featured);
const groomRest = BRIDAL_PARTY.filter((m) => m.side === 'groom' && !m.featured);

const CITIES = Array.from(new Set(BRIDAL_PARTY.map((m) => m.location.split(',')[0].trim())));
const STATES = Array.from(new Set(BRIDAL_PARTY.map((m) => (m.location.split(',')[1] || '').trim()).filter(Boolean)));

// ---------- Confetti ----------
async function fireConfetti(origin: { x: number; y: number }, count = 40) {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
        particleCount: count,
        spread: 70,
        startVelocity: 28,
        ticks: 120,
        origin,
        colors: [APRICOT, PINK, '#A4D4F4', IVORY, '#7FAA6E'],
    });
}

// ---------- Count-up number ----------
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const reduce = useReducedMotion();
    const [val, setVal] = useState(0);

    useEffect(() => {
        if (!inView) return;
        if (reduce) { setVal(to); return; }
        const controls = animate(0, to, {
            duration: 1.6,
            ease: 'easeOut',
            onUpdate: (v) => setVal(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, to, reduce]);

    return <span ref={ref}>{val}{suffix}</span>;
}

// ---------- Flip card ----------
function MemberCard({ member, index, featured = false }: { member: Member; index: number; featured?: boolean }) {
    const [flipped, setFlipped] = useState(false);
    const reduce = useReducedMotion();

    const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
    const accent = ACCENTS[index % ACCENTS.length];
    const sideColor = member.side === 'bride' ? PINK : APRICOT;
    const tilt = index % 2 === 0 ? -2 : 2;
    const fromX = index % 2 === 0 ? -40 : 40;

    const toggle = (el: HTMLElement) => {
        const next = !flipped;
        setFlipped(next);
        if (next && !reduce) {
            const r = el.getBoundingClientRect();
            fireConfetti({
                x: (r.left + r.width / 2) / window.innerWidth,
                y: (r.top + r.height / 2) / window.innerHeight,
            });
        }
    };

    const height = featured ? 'h-[26rem]' : 'h-[23rem]';
    const width = featured ? 'w-full sm:w-64' : 'w-full';

    const faceBase: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderRadius: 14,
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: reduce ? 0 : fromX, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={reduce ? undefined : { y: -8, rotate: 0, scale: 1.02 }}
            transition={{ duration: 0.55, delay: (index % 6) * 0.06 }}
            className={`relative ${width} ${height}`}
            style={{ perspective: 1000, rotate: reduce ? 0 : tilt }}
        >
            {/* Role sticker */}
            <div
                className="absolute -top-3 -right-2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md"
                style={{ backgroundColor: IVORY, border: `1.5px solid ${featured ? APRICOT : accent}` }}
                aria-hidden="true"
            >
                {roleEmoji(member.role)}
            </div>

            <div
                role="button"
                tabIndex={0}
                aria-label={`${member.name}, ${member.role}. ${flipped ? 'Showing their story. Press to flip back.' : 'Press to read their story.'}`}
                onClick={(e) => toggle(e.currentTarget)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(e.currentTarget);
                    }
                }}
                className="w-full h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
                style={{ ['--tw-ring-color' as string]: APRICOT }}
            >
                <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: reduce ? 0 : 0.6, ease: [0.4, 0.2, 0.2, 1] }}
                    style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
                >
                    {/* FRONT — polaroid */}
                    <div
                        style={{
                            ...faceBase,
                            backgroundColor: '#fff',
                            padding: featured ? 14 : 10,
                            paddingBottom: 0,
                            boxShadow: featured
                                ? `0 0 0 2px ${APRICOT}, 0 14px 40px ${APRICOT}66`
                                : `0 6px 20px rgba(18,59,84,0.12)`,
                            border: featured ? 'none' : `1px solid ${SAND}`,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            className="relative w-full flex-1 overflow-hidden"
                            style={{
                                borderRadius: 6,
                                backgroundColor: `${accent}20`,
                                border: member.photo ? 'none' : `2px solid ${accent}55`,
                            }}
                        >
                            {member.photo ? (
                                <Image src={member.photo} alt={member.name} fill className="object-cover" />
                            ) : (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ background: `linear-gradient(135deg, ${accent}25 0%, ${SAND}55 100%)` }}
                                >
                                    <span style={{ fontFamily: SERIF, fontSize: featured ? '4rem' : '3rem', color: accent, fontWeight: 300 }}>
                                        {initials}
                                    </span>
                                </div>
                            )}
                            {member.tag && (
                                <span
                                    className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full uppercase"
                                    style={{ backgroundColor: IVORY, color: SKY_DEEP, fontSize: '0.55rem', letterSpacing: '0.1em' }}
                                >
                                    {member.tag}
                                </span>
                            )}
                        </div>

                        <div className="text-center py-3">
                            <p style={{ fontFamily: HAND, fontSize: featured ? '1.7rem' : '1.4rem', color: SKY_DEEP, lineHeight: 1.1 }}>
                                {member.name}
                            </p>
                            <p
                                className="uppercase mt-1"
                                style={{ color: sideColor, fontSize: '0.6rem', letterSpacing: '0.15em' }}
                            >
                                {member.role}
                            </p>
                            <p className="mt-1.5" style={{ fontSize: '0.55rem', color: SKY_DEEP, opacity: 0.4, letterSpacing: '0.1em' }}>
                                TAP TO FLIP
                            </p>
                        </div>
                    </div>

                    {/* BACK — the story */}
                    <div
                        style={{
                            ...faceBase,
                            transform: 'rotateY(180deg)',
                            background: `linear-gradient(160deg, ${SKY_DEEP} 0%, #0a2438 100%)`,
                            padding: 18,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            boxShadow: `0 0 0 2px ${sideColor}, 0 14px 40px ${sideColor}44`,
                            overflow: 'auto',
                        }}
                    >
                        <Star size={16} style={{ color: APRICOT, fill: APRICOT }} className="mb-2 flex-shrink-0" />
                        <h3 style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 400, color: IVORY, lineHeight: 1.15 }}>
                            {member.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                            <MapPin size={10} style={{ color: APRICOT }} />
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,247,236,0.7)' }}>{member.location}</p>
                        </div>

                        <div className="w-8 h-px my-3" style={{ backgroundColor: APRICOT, opacity: 0.6 }} />

                        <p className="italic leading-relaxed" style={{ fontSize: '0.8rem', color: 'rgba(255,247,236,0.85)' }}>
                            &ldquo;{member.howTheyKnowUs.trim()}&rdquo;
                        </p>

                        {member.superlative && (
                            <p className="mt-3" style={{ fontFamily: HAND, fontSize: '1.15rem', color: APRICOT, lineHeight: 1.15 }}>
                                {member.superlative}
                            </p>
                        )}
                        {member.funFact && (
                            <p className="mt-2" style={{ fontSize: '0.7rem', color: 'rgba(255,247,236,0.6)' }}>
                                Fun fact: {member.funFact}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// ---------- Side section ----------
function SideSection({
    title, tagline, featured, rest, startIndex, accentTag,
}: {
    title: string; tagline: string; featured: Member[]; rest: Member[]; startIndex: number; accentTag: string;
}) {
    return (
        <div className="mb-8 last:mb-0">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-10"
            >
                <div className="h-8 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentTag }} />
                <div>
                    <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', fontWeight: 400, color: SKY_DEEP }}>{title}</h2>
                    <p className="text-xs mt-0.5" style={{ color: `${SKY_DEEP}80` }}>{tagline}</p>
                </div>
            </motion.div>

            {/* Spotlight row */}
            {featured.length > 0 && (
                <div className="mb-12">
                    <p
                        className="uppercase mb-6 flex items-center gap-2"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: accentTag }}
                    >
                        <Sparkles size={11} /> In the spotlight
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
                        {featured.map((m, i) => (
                            <MemberCard key={m.name} member={m} index={startIndex + i} featured />
                        ))}
                    </div>
                </div>
            )}

            {/* Everyone else */}
            {rest.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {rest.map((m, i) => (
                        <MemberCard key={m.name} member={m} index={startIndex + featured.length + i} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------- Face-off banner ----------
function FaceOff() {
    return (
        <div className="relative my-24 overflow-hidden rounded-3xl" style={{ backgroundColor: SKY_DEEP }}>
            <div className="grid grid-cols-2 relative">
                <motion.div
                    initial={{ x: -120, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="py-10 px-4 text-center"
                    style={{ background: `linear-gradient(120deg, ${PINK}cc, ${PINK}33)`, clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
                >
                    <p className="uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: IVORY }}>Team</p>
                    <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: IVORY, fontWeight: 300 }}>Jhoana</p>
                    <p className="mt-1" style={{ fontSize: '0.7rem', color: 'rgba(255,247,236,0.8)' }}>{brideFeatured.length + brideRest.length} strong</p>
                </motion.div>
                <motion.div
                    initial={{ x: 120, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="py-10 px-4 text-center"
                    style={{ background: `linear-gradient(240deg, ${APRICOT}dd, ${APRICOT}33)`, clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
                >
                    <p className="uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: SKY_DEEP }}>Team</p>
                    <p style={{ fontFamily: SERIF, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: SKY_DEEP, fontWeight: 400 }}>Damariel</p>
                    <p className="mt-1" style={{ fontSize: '0.7rem', color: SKY_DEEP, opacity: 0.7 }}>{groomFeatured.length + groomRest.length} strong</p>
                </motion.div>
            </div>
            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', delay: 0.5, stiffness: 180, damping: 12 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: IVORY, border: `3px solid ${SKY_DEEP}`, fontFamily: SERIF, fontSize: '1.2rem', color: SKY_DEEP, fontWeight: 600 }}
            >
                <Heart size={18} style={{ color: PINK, fill: PINK }} />
            </motion.div>
            <p className="text-center pb-6 pt-2" style={{ fontSize: '0.75rem', color: 'rgba(255,247,236,0.6)' }}>
                Two teams. One very loud cheering section.
            </p>
        </div>
    );
}

// ---------- Floating sparkles for hero ----------
const FLOATERS = [
    { left: '8%', top: '22%', size: 14, delay: 0, kind: 'sparkle' },
    { left: '18%', top: '70%', size: 12, delay: 1.2, kind: 'heart' },
    { left: '30%', top: '14%', size: 10, delay: 0.6, kind: 'sparkle' },
    { left: '46%', top: '82%', size: 12, delay: 2, kind: 'sparkle' },
    { left: '64%', top: '16%', size: 12, delay: 0.9, kind: 'heart' },
    { left: '78%', top: '68%', size: 14, delay: 1.6, kind: 'sparkle' },
    { left: '88%', top: '26%', size: 10, delay: 0.3, kind: 'sparkle' },
    { left: '94%', top: '80%', size: 12, delay: 2.2, kind: 'heart' },
] as const;

function Floaters() {
    const reduce = useReducedMotion();
    if (reduce) return null;
    return (
        <>
            {FLOATERS.map((f, i) => {
                const Icon = f.kind === 'heart' ? Heart : Sparkles;
                return (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{ left: f.left, top: f.top }}
                        animate={{ y: [0, -14, 0], opacity: [0.25, 0.7, 0.25], rotate: [0, 15, 0] }}
                        transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
                        aria-hidden="true"
                    >
                        <Icon size={f.size} style={{ color: f.kind === 'heart' ? PINK : APRICOT, fill: f.kind === 'heart' ? PINK : 'none' }} />
                    </motion.div>
                );
            })}
        </>
    );
}

// ---------- Page ----------
export default function BridalPartyPage() {
    const reduce = useReducedMotion();

    // Welcome confetti from both sides when the page loads
    useEffect(() => {
        if (reduce) return;
        const t = setTimeout(() => {
            fireConfetti({ x: 0.15, y: 0.35 }, 50);
            fireConfetti({ x: 0.85, y: 0.35 }, 50);
        }, 700);
        return () => clearTimeout(t);
    }, [reduce]);

    const marqueeNames = BRIDAL_PARTY.map((m) => m.name);

    const stats = [
        { num: BRIDAL_PARTY.length, label: 'Incredible Humans' },
        { num: CITIES.length, label: 'Cities Represented' },
        { num: STATES.length, label: 'States, One Wedding Squad' },
    ];

    return (
        <div style={{ backgroundColor: IVORY }}>
            <style>{`
                @keyframes bp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .bp-marquee-track { animation: bp-marquee 40s linear infinite; }
                @media (prefers-reduced-motion: reduce) { .bp-marquee-track { animation: none; } }
            `}</style>

            {/* Hero */}
            <div
                className="pt-32 pb-16 px-6 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}
            >
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${PINK} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${APRICOT} 0%, transparent 50%)` }}
                />
                <Floaters />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <p className="uppercase tracking-widest mb-4 flex items-center justify-center gap-2" style={{ color: APRICOT, fontSize: '0.65rem', letterSpacing: '0.3em' }}>
                            <Sparkles size={12} /> The Real MVPs
                        </p>
                        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 300, color: IVORY, lineHeight: 1.05 }}>
                            Meet the{' '}
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>Bridal Party</span>
                        </h1>
                        <p className="mt-4 max-w-lg mx-auto" style={{ color: 'rgba(255,247,236,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            The ride-or-dies, the childhood best friends, the brothers who&apos;ve been in our corner since
                            before we could tie a tie. These are the people standing beside us — hype squad included.
                        </p>

                        {/* Animated stat strip */}
                        <div className="mt-10 flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
                            {stats.map((s) => (
                                <div key={s.label} className="text-center">
                                    <p style={{ fontFamily: SERIF, fontSize: '2.75rem', color: APRICOT, fontWeight: 300, lineHeight: 1 }}>
                                        <CountUp to={s.num} />
                                    </p>
                                    <p className="uppercase tracking-widest mt-2" style={{ fontSize: '0.55rem', color: 'rgba(255,247,236,0.6)', letterSpacing: '0.12em' }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* City chips */}
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {CITIES.map((c, i) => (
                                <motion.span
                                    key={c}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
                                    style={{ fontSize: '0.7rem', color: IVORY, border: '1px solid rgba(255,247,236,0.25)', backgroundColor: 'rgba(255,247,236,0.06)' }}
                                >
                                    <MapPin size={10} style={{ color: APRICOT }} /> {c}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Names marquee */}
            <div className="overflow-hidden py-3" style={{ backgroundColor: APRICOT }} aria-hidden="true">
                <div className="bp-marquee-track flex whitespace-nowrap w-max">
                    {[0, 1].map((dup) => (
                        <div key={dup} className="flex items-center">
                            {marqueeNames.map((n) => (
                                <span key={`${dup}-${n}`} className="flex items-center" style={{ fontFamily: SERIF, fontSize: '1.1rem', color: SKY_DEEP, fontStyle: 'italic' }}>
                                    <span className="px-5">{n}</span>
                                    <Heart size={11} style={{ color: SKY_DEEP, fill: SKY_DEEP }} />
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Meet the party */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <SideSection
                        title="Jhoana's Crew"
                        tagline="The ones who've heard every version of this love story since day one."
                        featured={brideFeatured}
                        rest={brideRest}
                        startIndex={0}
                        accentTag={PINK}
                    />

                    <FaceOff />

                    <SideSection
                        title="Damariel's Crew"
                        tagline="Brothers by blood, brothers by choice — same energy either way."
                        featured={groomFeatured}
                        rest={groomRest}
                        startIndex={brideFeatured.length + brideRest.length}
                        accentTag={APRICOT}
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}>
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <motion.div
                            animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-block mb-5"
                        >
                            <Heart size={28} style={{ color: APRICOT, fill: APRICOT }} />
                        </motion.div>
                        <h2 style={{ fontFamily: SERIF, fontSize: '2.5rem', fontWeight: 300, color: IVORY, lineHeight: 1.1 }}>
                            Thank you for being{' '}
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>part of this</span>
                        </h2>
                        <p className="mt-4 mb-8" style={{ color: 'rgba(255,247,236,0.65)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Whether you&apos;re standing with us at one celebration or both, you&apos;re the reason
                            we get to say &ldquo;I do&rdquo; surrounded by the people we love most. Now let&apos;s make it official on paper.
                        </p>
                        <Link
                            href="/rsvp"
                            onClick={(e) => {
                                if (reduce) return;
                                const r = e.currentTarget.getBoundingClientRect();
                                fireConfetti({ x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }, 30);
                            }}
                            className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-transform hover:scale-105"
                            style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: '0.15em' }}
                        >
                            Complete Your RSVP
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}