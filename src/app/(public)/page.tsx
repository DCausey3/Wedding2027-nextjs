"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Mail, Phone, Key, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Image from "next/image";

type LoginMethod = 'code' | 'email' | 'phone';

// Palette — Sky Blue + Apricot + Ivory + Sand
const COLORS = {
    navy: '#2c3e4a',       // primary text / dark UI elements
    navyDeep: '#1f2e38',   // button hover / darkest accents
    skyBlue: '#A4D4F4',    // accent — links, highlights, italic emphasis
    apricot: '#FFB482',    // accent — icons, badges, CTA highlights
    peach: '#FFD6C2',      // soft accent / hover states
    ivory: '#FFF7EC',      // page background, light text on dark
    sand: '#E6D2B3',       // secondary backgrounds (pills, inputs)
    sandLight: '#F2E8D5',  // input backgrounds
    greenery: '#7FAA6E',   // reserved for success states
    muted: '#8a9aa5',      // muted/inactive text
    error: '#d4183d',
};

export default function LoginPage() {
    const [method, setMethod] = useState<LoginMethod>('code');
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setGuest } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            let url = '';
            const normalizedValue = value.trim();

            if (method === 'code') {
                url = `/api/rsvp/lookup?code=${encodeURIComponent(normalizedValue.toUpperCase())}`;
            } else if (method === 'email') {
                if (normalizedValue.length <= 3 || !normalizedValue.includes('@')) {
                    throw new Error('Please enter a valid email address.');
                }
                url = `/api/rsvp/lookup?email=${encodeURIComponent(normalizedValue.toLowerCase())}`;
            } else if (method === 'phone') {
                if (normalizedValue.length < 7) {
                    throw new Error('Please enter a valid phone number.');
                }
                url = `/api/rsvp/lookup?phone=${encodeURIComponent(normalizedValue)}`;
            }

            const res = await fetch(url);
            const json = await res.json();

            // DEBUG: inspect the raw API response before anything else touches it.
            console.log("[Login] full /api/rsvp/lookup response:", json);

            if (!res.ok) {
                throw new Error(json.error ?? 'Invitation not found. Please verify your details and try again.');
            }

            const guest = json.guest;

            // DEBUG: confirm the exact field names/values coming back for attendance.
            console.log("[Login] guest object:", guest);
            console.log("[Login] guest.stdAttendingColombia:", guest?.stdAttendingColombia, typeof guest?.stdAttendingColombia);
            console.log("[Login] guest.stdAttendingFlorida:", guest?.stdAttendingFlorida, typeof guest?.stdAttendingFlorida);
            console.log("[Login] guest.stdResponded:", guest?.stdResponded);

            // Sync with your AuthContext state management
            setGuest(guest);

            // Soft RSVP gate: if they haven't confirmed save-the-date yet,
            // send them there instead of the homepage. Hard RSVP comes later.
            sessionStorage.setItem('guest', JSON.stringify(guest));
            console.log("[Login] wrote to sessionStorage:", sessionStorage.getItem('guest'));

            if (!guest.stdResponded) {
                setError('');
                router.push(`/save-the-date?guest=${guest.id}`);
            } else {
                router.push('/home');
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected network error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: COLORS.ivory }}>
            {/* Left panel — image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <Image
                    src="/IMG_8206.jpeg"
                    alt="Jhoana & Damariel"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center 20%' }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, rgba(44,62,74,0.78) 0%, rgba(44,62,74,0) 50%)` }}
                />
                <div className="absolute bottom-16 left-12 right-12">
                    <p
                        className="uppercase tracking-widest mb-4"
                        style={{
                            color: COLORS.peach,
                            fontSize: '0.6rem',
                            letterSpacing: '0.3em',
                            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                        }}
                    >
                        Welcome
                    </p>
                    <h2
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '3rem',
                            fontWeight: 300,
                            color: COLORS.ivory,
                            lineHeight: 1.1,
                            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                        }}
                    >
                        Your personal
                        <br />
                        <span style={{ fontStyle: 'italic', color: COLORS.skyBlue, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
                            wedding portal
                        </span>
                    </h2>
                    <p
                        className="mt-4"
                        style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.9rem', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                    >
                        Access your personalized invitation, RSVP, and travel details.
                    </p>
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full max-w-md"
                >
                    <div className="flex items-center gap-2 mb-10">
                        <Heart size={16} style={{ color: COLORS.apricot, fill: COLORS.apricot }} />
                        <span className="uppercase tracking-widest text-xs" style={{ color: COLORS.navy, letterSpacing: '0.2em' }}>
                            J &amp; D — 2027
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '2.75rem',
                            fontWeight: 300,
                            color: COLORS.navy,
                            lineHeight: 1.1,
                        }}
                    >
                        Guest Login
                    </h1>
                    <p style={{ color: COLORS.muted, fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
                        First time here? Use your invitation code.
                        Returning guests may sign in with their email, phone number or Invitation Code.
                    </p>

                    {/* Method selector */}
                    <div className="flex rounded-full p-1 mb-8" style={{ backgroundColor: COLORS.sand }}>
                        {([['code', 'Invite Code'], ['email', 'Email'], ['phone', 'Phone']] as [LoginMethod, string][]).map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => { setMethod(m); setValue(''); setError(''); }}
                                className="flex-1 py-2 rounded-full text-xs uppercase tracking-widest transition-all"
                                style={{
                                    letterSpacing: '0.12em',
                                    backgroundColor: method === m ? COLORS.navy : 'transparent',
                                    color: method === m ? COLORS.ivory : COLORS.muted,
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={method}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="relative mb-4">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    {method === 'code' && <Key size={16} style={{ color: COLORS.apricot }} />}
                                    {method === 'email' && <Mail size={16} style={{ color: COLORS.apricot }} />}
                                    {method === 'phone' && <Phone size={16} style={{ color: COLORS.apricot }} />}
                                </div>
                                <input
                                    type={method === 'email' ? 'email' : method === 'phone' ? 'tel' : 'text'}
                                    value={value}
                                    onChange={(e) => { setValue(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    placeholder={
                                        method === 'code'
                                            ? 'Enter your invite code (e.g. JDWED2026)'
                                            : method === 'email'
                                                ? 'your@email.com'
                                                : '+1 (555) 000-0000'
                                    }
                                    className="w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all"
                                    style={{
                                        backgroundColor: COLORS.sandLight,
                                        border: error ? `1.5px solid ${COLORS.error}` : '1.5px solid transparent',
                                        color: COLORS.navy,
                                        fontSize: '0.9rem',
                                    }}
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 text-sm"
                                    style={{ color: COLORS.error }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={loading || !value.trim()}
                                className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
                                style={{
                                    backgroundColor: COLORS.navy,
                                    color: COLORS.ivory,
                                    letterSpacing: '0.15em',
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <>
                                        Access My Portal
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center gap-2">
                        <Lock size={12} style={{ color: COLORS.muted }} />
                        <p className="text-xs" style={{ color: COLORS.muted }}>
                            Your information is private and secure.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}