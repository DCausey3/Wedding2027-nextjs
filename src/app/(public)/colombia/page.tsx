"use client";

import { motion } from 'motion/react';
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Clock, Shirt, ChevronRight, Sun, Plane, FileText, Info } from 'lucide-react';
import { CountdownTimer } from '../../../components/ui/CountdownTimer';

// Wedding date is still being finalized — no countdown/timeline shown until it's locked in.
const COLOMBIA_DATE_CONFIRMED = false;
const COLOMBIA_DATE = new Date('2027-06-12T18:00:00'); // placeholder, matches homepage — update once confirmed

const HERO = 'https://images.unsplash.com/photo-1643068730310-e8cff093b7ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHx0cm9waWNhbCUyMGRlc3RpbmF0aW9uJTIwd2VkZGluZyUyMENvbG9tYmlhJTIwbHV4dXJ5fGVufDF8fHx8MTc4MDA4NTk2NXww&ixlib=rb-4.1.0&q=80&w=1080';

// Palette — Sky Blue + Apricot + Ivory + Sand
const SKY_DEEP = "#123B54";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";
const SKY_LIGHT = "#EAF5FD";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F5EDE0";
const APRICOT = "#FFB482";

// Things a guest traveling from the USA needs to sort out ahead of time.
const travelPrep = [
    {
        icon: FileText,
        label: 'Passport',
        value: 'A valid U.S. passport is required to enter Colombia — no visa needed for stays under 90 days.',
    },
    {
        icon: Clock,
        label: 'Passport Timing',
        value: 'Make sure your passport is valid for at least 6 months past the wedding date, and apply/renew early if it isn\'t current.',
    },
    {
        icon: Info,
        label: 'Entry Requirements',
        value: 'No vaccination requirements at this time — we\'ll share updates here if that changes.',
    },
    {
        icon: Sun,
        label: 'Climate',
        value: 'Expect warm, tropical weather — pack light, breathable clothing.',
    },
];

export default function ColombiaPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Hero */}
            <div className="relative h-screen min-h-[600px] overflow-hidden flex items-end pb-24">
                <Image
                    src={HERO}
                    alt="Colombia wedding"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,59,84,0.75) 0%, rgba(18,59,84,0.15) 60%, rgba(18,59,84,0) 100%)' }} />
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(to right, ${SKY_MID}, ${APRICOT})` }}
                />
                <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        <p className="uppercase tracking-widest mb-3" style={{ color: SKY, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            Colombia Wedding
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                                fontWeight: 300,
                                color: IVORY,
                                lineHeight: 1.0,
                            }}
                        >
                            Colombia
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: SKY }} />
                                <span className="text-sm" style={{ color: IVORY }}>
                                    {COLOMBIA_DATE_CONFIRMED ? 'June 12, 2027' : 'Date & Venue Coming Soon'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Still finalizing notice */}
            <div className="py-10 px-6 flex flex-col items-center text-center" style={{ background: `linear-gradient(to right, ${SKY_DEEP}, ${SKY_MID})` }}>
                <p className="uppercase tracking-widest mb-3" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.55rem', letterSpacing: '0.3em' }}>
                    Still Planning
                </p>
                <p className="max-w-md text-sm" style={{ color: IVORY }}>
                    We're still finalizing the venue and exact date for Colombia — check back soon, and we'll update
                    this page (and email you!) the moment it's confirmed.
                </p>
                {COLOMBIA_DATE_CONFIRMED && (
                    <div className="mt-6">
                        <CountdownTimer targetDate={COLOMBIA_DATE} textColor={IVORY} accentColor={SKY} size="lg" />
                    </div>
                )}
            </div>

            {/* Travel prep for USA guests */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-14"
                    >
                        <p className="uppercase tracking-widest mb-3" style={{ color: SKY_MID, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            Traveling From The USA
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: SKY_DEEP, lineHeight: 1.1 }}>
                            Start Preparing Now
                        </h2>
                        <p className="mt-4 max-w-md mx-auto" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: '0.9rem' }}>
                            While we finalize the venue, here's what you can already take care of — especially your passport,
                            since that can take the longest.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {travelPrep.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className="p-5 rounded-xl"
                                style={{ backgroundColor: SKY_LIGHT, border: `1px solid ${SKY}` }}
                            >
                                <item.icon size={16} style={{ color: SKY_MID }} className="mb-2" />
                                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: SKY_MID, letterSpacing: '0.1em' }}>{item.label}</p>
                                <p className="text-sm" style={{ color: SKY_DEEP, opacity: 0.85 }}>{item.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-6 p-5 rounded-xl flex items-start gap-3"
                        style={{ backgroundColor: SAND_LIGHT, border: `1px solid ${SAND}` }}
                    >
                        <Plane size={16} style={{ color: APRICOT, marginTop: 2, flexShrink: 0 }} />
                        <p className="text-sm leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.75 }}>
                            Flight, hotel, and local transportation details will be added here once the venue is confirmed.
                            If you'd like to start researching flights in the meantime, most guests will likely be flying
                            into a major airport in the Eje Cafetero / Pereira region — we'll confirm the exact airport soon.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Travel CTA */}
            <section
                className="py-20 px-6"
                style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, ${SKY_MID} 50%, ${SKY} 100%)` }}
            >
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <Plane size={32} className="mx-auto mb-6" style={{ color: 'rgba(255,247,236,0.7)' }} />
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: IVORY, lineHeight: 1.1 }}>
                            Planning your trip to Colombia?
                        </h2>
                        <p className="mt-4 mb-8" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.9rem' }}>
                            We'll share hotel blocks, flight suggestions, and every detail you need as soon as they're
                            confirmed. For now, get your passport sorted and stay tuned!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/travel"
                                className="px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                                style={{ backgroundColor: IVORY, color: SKY_DEEP, letterSpacing: '0.2em' }}
                            >
                                Travel Details
                            </Link>
                            <Link
                                href="/rsvp"
                                className="px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:bg-white/10"
                                style={{ border: '1px solid rgba(255,247,236,0.5)', color: IVORY, letterSpacing: '0.2em' }}
                            >
                                RSVP for Colombia
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}