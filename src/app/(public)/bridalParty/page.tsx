"use client";

import { motion } from 'motion/react';
import { MapPin, Heart, Sparkles } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

// Palette — Sky Blue + Apricot + Ivory + Sand
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const APRICOT = "#FFB482";

interface Member {
    name: string;
    role: string;
    side: 'bride' | 'groom';
    location: string;
    howTheyKnowUs: string;
    photo?: string; // optional — falls back to initials avatar if not provided
}

// TODO: replace with your real bridal party — names, roles, hometowns,
// and a short line on how each person knows the bride/groom.
// No "attending which wedding" info shown here on purpose, since some
// bridal party members will only be at one location.
const BRIDAL_PARTY: Member[] = [
    { name: 'Vivi Cardenas', role: 'Matron of Honor', side: 'bride', location: 'Atlanta Georgia', howTheyKnowUs: 'Cousins wife who became an older sister' },
    { name: 'Tori Levy', role: 'Co-Maid of Honor', side: 'bride', location: 'Tampa, Florida', howTheyKnowUs: 'Childhood best friend of the bride' },
    { name: 'Angelica Guinand', role: 'Co-Maid of Honor', side: 'bride', location: 'Tampa, Florida', howTheyKnowUs: 'Childhood best friend of the bride' },
    { name: 'Alejandra Cardenas', role: 'Bridesmaid', side: 'bride', location: 'Tampa, Florida', howTheyKnowUs: 'Twin sister' },
    { name: 'Anabelle Manriquez', role: 'Bridesmaid', side: 'bride', location: 'Tampa, Florida', howTheyKnowUs: 'Family friend' },
    { name: 'Angelica Peregrino', role: 'Bridesmaid', side: 'bride', location: 'Dallas,Texas', howTheyKnowUs: 'Sister in law' },
    { name: 'Andrea Figueroa', role: 'Bridesmaid', side: 'bride', location: 'Tampa, Florida', howTheyKnowUs: 'Family friend' },
    { name: 'Steve Atkins', role: 'Co-Best Man', side: 'groom', location: 'Orlando,Florida', howTheyKnowUs: 'Best Friend from High school and Played  Basketball and Baseball together' },
    { name: 'James Calhoun', role: 'Co-Best Man', side: 'groom', location: 'Jacksonville,Florida', howTheyKnowUs: 'Best Friend since 5th Grade and Played Football and Baseball together ' },
    { name: 'David Green', role: 'Groomsman', side: 'groom', location: 'Gainesville,Florida', howTheyKnowUs: 'Best Friend Since 2nd Grade ' },
    { name: 'Damarcus Causey', role: 'Groomsman', side: 'groom', location: 'Dallas,Texas', howTheyKnowUs: 'Fourth oldest brother' },
    { name: 'Davinus Causey', role: 'Groomsman', side: 'groom', location: 'Tampa,Florida', howTheyKnowUs: 'Third oldest brother ' },
    { name: 'Brandon Causey', role: 'Groomsman', side: 'groom', location: 'Atlanta,Georgia', howTheyKnowUs: 'Second Oldest brother ' },
    { name: 'Nick Causey', role: 'Groomsman', side: 'groom', location: 'Pensacola,Florida', howTheyKnowUs: 'Oldest Brother' },
];

// Distinct accent per person, cycling through the palette so the grid
// doesn't feel monotone — purely decorative, unrelated to attendance.
const ACCENTS = [SKY_DEEP, APRICOT, "#7FAA6E", "#A4D4F4", "#c98a55", "#5FA8D3"];

// Playful little role badge — purely decorative, keyed off common role words.
function roleEmoji(role: string) {
    const r = role.toLowerCase();
    if (r.includes('matron') || r.includes('maid of honor')) return '👑';
    if (r.includes('best man')) return '🎩';
    if (r.includes('bridesmaid')) return '💐';
    if (r.includes('groomsman')) return '🤵';
    return '✨';
}

const brideParty = BRIDAL_PARTY.filter((m) => m.side === 'bride');
const groomParty = BRIDAL_PARTY.filter((m) => m.side === 'groom');

function MemberCard({ member, index }: { member: Member; index: number }) {
    const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
    const accent = ACCENTS[index % ACCENTS.length];
    const tilt = index % 2 === 0 ? -1.5 : 1.5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, rotate: tilt }}
            transition={{ duration: 0.5, delay: (index % 8) * 0.06 }}
            className="relative flex flex-col items-center text-center p-6 rounded-2xl"
            style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
        >
            {/* Role badge — little sticker in the corner */}
            <div
                className="absolute -top-3 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm"
                style={{ backgroundColor: IVORY, border: `1.5px solid ${accent}` }}
                aria-hidden="true"
            >
                {roleEmoji(member.role)}
            </div>

            {member.photo ? (
                <div className="w-16 h-16 rounded-full overflow-hidden mb-4 relative">
                    <Image src={member.photo} alt={member.name} fill className="object-cover" />
                </div>
            ) : (
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${accent}20`, border: `2px solid ${accent}` }}
                >
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: accent, fontWeight: 400 }}>
                        {initials}
                    </span>
                </div>
            )}
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 400, color: SKY_DEEP }}>
                {member.name}
            </h3>
            <p
                className="text-xs uppercase tracking-widest mt-1 mb-2"
                style={{ color: member.side === 'bride' ? '#ec4899' : APRICOT, letterSpacing: '0.1em' }}
            >
                {member.role}
            </p>
            <div className="flex items-center gap-1">
                <MapPin size={10} style={{ color: SKY_DEEP, opacity: 0.4 }} />
                <p className="text-xs" style={{ color: SKY_DEEP, opacity: 0.6 }}>{member.location}</p>
            </div>
            <div className="w-8 h-px my-3" style={{ backgroundColor: SAND }} />
            <p className="text-xs leading-relaxed italic" style={{ color: SKY_DEEP, opacity: 0.6 }}>
                &ldquo;{member.howTheyKnowUs.trim()}&rdquo;
            </p>
        </motion.div>
    );
}

function SideSection({
                         title, tagline, members, startIndex, accentTag,
                     }: {
    title: string; tagline: string; members: Member[]; startIndex: number; accentTag: string;
}) {
    return (
        <div className="mb-20 last:mb-0">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-8"
            >
                <div className="h-8 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentTag }} />
                <div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 400, color: SKY_DEEP }}>
                        {title}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: `${SKY_DEEP}80` }}>{tagline}</p>
                </div>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {members.map((member, i) => (
                    <MemberCard key={`${member.name}-${i}`} member={member} index={startIndex + i} />
                ))}
            </div>
        </div>
    );
}

export default function BridalPartyPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Hero */}
            <div
                className="pt-32 pb-24 px-6 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}
            >
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `radial-gradient(circle at 20% 50%, #ec4899 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${APRICOT} 0%, transparent 50%)` }}
                />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <p className="uppercase tracking-widest mb-4 flex items-center justify-center gap-2" style={{ color: APRICOT, fontSize: '0.65rem', letterSpacing: '0.3em' }}>
                            <Sparkles size={12} /> The Real MVPs
                        </p>
                        <h1
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 300, color: IVORY, lineHeight: 1.05 }}
                        >
                            Meet the{' '}
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>Bridal Party</span>
                        </h1>
                        <p className="mt-4 max-w-lg mx-auto" style={{ color: 'rgba(255,247,236,0.7)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            The ride-or-dies, the childhood best friends, the brothers who&apos;ve been in our corner since
                            before we could tie a tie. These are the people standing beside us — hype squad included.
                        </p>

                        {/* Fun stat strip */}
                        <div className="mt-10 flex items-center justify-center gap-8 sm:gap-14 flex-wrap">
                            {[
                                { num: BRIDAL_PARTY.length, label: 'Incredible Humans' },
                                { num: '20+', label: 'Years of Friendship, Combined' },
                                { num: '0', label: 'Regrets Asking' },
                            ].map((s) => (
                                <div key={s.label} className="text-center">
                                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.25rem', color: APRICOT, fontWeight: 300 }}>
                                        {s.num}
                                    </p>
                                    <p className="uppercase tracking-widest mt-1" style={{ fontSize: '0.55rem', color: 'rgba(255,247,236,0.6)', letterSpacing: '0.12em' }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Meet the party — grouped by side, each with its own playful intro */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <SideSection
                        title="Jhoana's Crew"
                        tagline="The ones who've heard every version of this love story since day one."
                        members={brideParty}
                        startIndex={0}
                        accentTag="#ec4899"
                    />
                    <SideSection
                        title="Damariel's Crew"
                        tagline="Brothers by blood, brothers by choice — same energy either way."
                        members={groomParty}
                        startIndex={brideParty.length}
                        accentTag={APRICOT}
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #0a2438 100%)` }}>
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <Heart size={28} className="mx-auto mb-5" style={{ color: APRICOT, fill: APRICOT }} />
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', fontWeight: 300, color: IVORY, lineHeight: 1.1 }}>
                            Thank you for being{' '}
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>part of this</span>
                        </h2>
                        <p className="mt-4 mb-8" style={{ color: 'rgba(255,247,236,0.65)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            We are so grateful to have you by our side. You make everything more beautiful.
                        </p>
                        <Link
                            href="/rsvp"
                            className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-widest"
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