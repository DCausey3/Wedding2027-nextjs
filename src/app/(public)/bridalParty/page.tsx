"use client";

import { motion } from 'motion/react';
import { MapPin, Heart } from 'lucide-react';
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
    { name: 'Maid of Honor Name', role: 'Maid of Honor', side: 'bride', location: 'City, State/Country', howTheyKnowUs: 'Childhood best friend of the bride' },
    { name: 'Bridesmaid Name', role: 'Bridesmaid', side: 'bride', location: 'City, State/Country', howTheyKnowUs: 'College roommate of the bride' },
    { name: 'Bridesmaid Name', role: 'Bridesmaid', side: 'bride', location: 'City, State/Country', howTheyKnowUs: 'Cousin of the bride' },
    { name: 'Bridesmaid Name', role: 'Bridesmaid', side: 'bride', location: 'City, State/Country', howTheyKnowUs: 'Coworker and close friend of the bride' },
    { name: 'Best Man Name', role: 'Best Man', side: 'groom', location: 'City, State/Country', howTheyKnowUs: 'Brother of the groom' },
    { name: 'Groomsman Name', role: 'Groomsman', side: 'groom', location: 'City, State/Country', howTheyKnowUs: 'College roommate of the groom' },
    { name: 'Groomsman Name', role: 'Groomsman', side: 'groom', location: 'City, State/Country', howTheyKnowUs: 'Childhood friend of the groom' },
    { name: 'Groomsman Name', role: 'Groomsman', side: 'groom', location: 'City, State/Country', howTheyKnowUs: 'Cousin of the groom' },
];

// Distinct accent per person, cycling through the palette so the grid
// doesn't feel monotone — purely decorative, unrelated to attendance.
const ACCENTS = [SKY_DEEP, APRICOT, "#7FAA6E", "#A4D4F4", "#c98a55", "#5FA8D3"];

function MemberCard({ member, index }: { member: Member; index: number }) {
    const initials = member.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
    const accent = ACCENTS[index % ACCENTS.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.07 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl"
            style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
        >
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
            <p className="text-xs leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.55 }}>
                {member.howTheyKnowUs}
            </p>
        </motion.div>
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
                        <h1
                            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 300, color: IVORY, lineHeight: 1.05 }}
                        >
                            Meet the{' '}
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>Bridal Party</span>
                        </h1>
                        <p className="mt-4" style={{ color: 'rgba(255,247,236,0.65)', fontSize: '0.95rem' }}>
                            The people standing beside us on our biggest day.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Meet the party */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {BRIDAL_PARTY.map((member, i) => (
                            <MemberCard key={`${member.name}-${i}`} member={member} index={i} />
                        ))}
                    </div>
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