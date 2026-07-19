"use client";

import { motion } from 'motion/react';
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Clock, Shirt, ChevronRight, Plane, Car, Hotel } from 'lucide-react';
import { CountdownTimer } from '../../../components/ui/CountdownTimer';

const TEXAS_DATE = new Date('2027-04-30T18:00:00'); // ceremony time still TBD — using a placeholder evening time

const HERO = 'https://images.unsplash.com/photo-1719008682128-5ebdbc7ccfab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGbG9yaWRhJTIwY29hc3RhbCUyMGVsZWdhbnQlMjB3ZWRkaW5nJTIwdmVudWUlMjBzdW5zZXR8ZW58MXx8fHwxNzgwMDg1OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080';

// Palette — Sky Blue + Apricot + Ivory + Sand
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F5EDE0";
const APRICOT = "#FFB482";
const APRICOT_LIGHT = "#FFF1E5";
const GREENERY = "#7FAA6E";

const basicTravelInfo = [
    { icon: MapPin, label: 'Venue', value: 'Marty Leonard Chapel, Fort Worth, TX' },
    { icon: Calendar, label: 'Date', value: 'April 30, 2027' },
    { icon: Clock, label: 'Time', value: 'Ceremony time to be announced' },
    { icon: Plane, label: 'Airport', value: 'Fly into DFW (Dallas/Fort Worth Int\'l) or Dallas Love Field' },
    { icon: Car, label: 'Getting Around', value: 'A car or rideshare is recommended once you land' },
    { icon: Hotel, label: 'Lodging', value: 'Hotel block details coming soon' },
];

export default function TexasPage() {
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Hero */}
            <div className="relative h-screen min-h-[600px] overflow-hidden flex items-end pb-24">
                <Image
                    src={HERO}
                    alt="Texas wedding venue"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,59,84,0.75) 0%, rgba(18,59,84,0.15) 60%, rgba(18,59,84,0) 100%)' }} />
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(to right, ${GREENERY}, ${APRICOT})` }}
                />
                <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        <p className="uppercase tracking-widest mb-3" style={{ color: APRICOT, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            Texas Wedding
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
                            Fort Worth,
                            <br />
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>Texas</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>April 30, 2027</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>Marty Leonard Chapel</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>Time to be announced</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Countdown strip */}
            <div
                className="py-10 px-6 flex flex-col items-center"
                style={{ background: `linear-gradient(to right, ${SKY_DEEP}, ${GREENERY})` }}
            >
                <p className="uppercase tracking-widest mb-4" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.55rem', letterSpacing: '0.3em' }}>
                    Counting Down To Texas
                </p>
                <CountdownTimer targetDate={TEXAS_DATE} textColor={IVORY} accentColor={APRICOT} size="lg" />
            </div>

            {/* Micro-wedding notice */}
            <section className="py-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-2xl mx-auto text-center p-8 rounded-2xl"
                    style={{ backgroundColor: APRICOT_LIGHT, border: `1px solid ${APRICOT}` }}
                >
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 400, color: SKY_DEEP }}>
                        A Small, Intimate Celebration
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.75 }}>
                        Our Fort Worth wedding at Marty Leonard Chapel will be a micro-intimate gathering with our
                        closest family and friends. We're so glad you're part of it.
                    </p>
                </motion.div>
            </section>

            {/* Basic travel info */}
            <section className="py-16 px-6" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-14"
                    >
                        <p className="uppercase tracking-widest mb-3" style={{ color: APRICOT, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            Getting There
                        </p>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: SKY_DEEP }}>
                            Basic Travel Information
                        </h2>
                        <p className="mt-4 max-w-md mx-auto" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: '0.9rem' }}>
                            We're still finalizing ceremony timing and hotel details — here's what's confirmed so far.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {basicTravelInfo.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.06 }}
                                className="p-5 rounded-xl"
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <item.icon size={16} style={{ color: APRICOT }} className="mb-2" />
                                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: APRICOT, letterSpacing: '0.1em' }}>{item.label}</p>
                                <p className="text-sm" style={{ color: SKY_DEEP, opacity: 0.85 }}>{item.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RSVP CTA */}
            <section
                className="py-20 px-6"
                style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, ${GREENERY} 50%, ${APRICOT} 100%)` }}
            >
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <Plane size={32} className="mx-auto mb-6" style={{ color: 'rgba(255,247,236,0.7)' }} />
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: IVORY, lineHeight: 1.1 }}>
                            Planning your trip to Fort Worth?
                        </h2>
                        <p className="mt-4 mb-8" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.9rem' }}>
                            More details on lodging and timing are on the way. In the meantime, here's what you can plan around.
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
                                RSVP for Texas
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}