"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Mail, Phone, Key, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Image from "next/image";

type LoginMethod = 'code' | 'email' | 'phone';

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

            if (!res.ok) {
                throw new Error(json.error ?? 'Invitation not found. Please verify your details and try again.');
            }

            const guest = json.guest;

            // Sync with your AuthContext state management
            setGuest(guest);

            // Soft RSVP gate: if they haven't confirmed save-the-date yet,
            // send them there instead of the homepage. Hard RSVP comes later.
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
        <div className="min-h-screen flex" style={{ backgroundColor: '#fdf8f0' }}>
            {/* Left panel — image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <Image
                    src="/IMG_2960.JPG"
                    alt="Jhoana & Damariel"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center 20%' }}
                />
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(10,7,3,0) 60%, rgba(253,248,240,0.4) 100%)' }}
                />
                <div className="absolute top-1/2 -translate-y-1/2 left-12 right-12">
                    <p className="uppercase tracking-widest mb-4" style={{ color: '#f5e6c8', fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                        Welcome
                    </p>
                    <h2
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '3rem',
                            fontWeight: 300,
                            color: '#fdf8f0',
                            lineHeight: 1.1,
                        }}
                    >
                        Your personal
                        <br />
                        <span style={{ fontStyle: 'italic', color: '#d4a574' }}>wedding portal</span>
                    </h2>
                    <p className="mt-4" style={{ color: 'rgba(253,248,240,0.7)', fontSize: '0.9rem' }}>
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
                        <Heart size={16} style={{ color: '#d4a574', fill: '#d4a574' }} />
                        <span className="uppercase tracking-widest text-xs" style={{ color: '#1a1209', letterSpacing: '0.2em' }}>
                            J &amp; D — 2026
                        </span>
                    </div>

                    <h1
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '2.75rem',
                            fontWeight: 300,
                            color: '#1a1209',
                            lineHeight: 1.1,
                        }}
                    >
                        Guest Login
                    </h1>
                    <p>
                        First time here? Use your invitation code.
                        Returning guests may sign in with their email or phone number.
                    </p>

                    {/* Method selector */}
                    <div className="flex rounded-full p-1 mb-8" style={{ backgroundColor: '#f0e8d8' }}>
                        {([['code', 'Invite Code'], ['email', 'Email'], ['phone', 'Phone']] as [LoginMethod, string][]).map(([m, label]) => (
                            <button
                                key={m}
                                onClick={() => { setMethod(m); setValue(''); setError(''); }}
                                className="flex-1 py-2 rounded-full text-xs uppercase tracking-widest transition-all"
                                style={{
                                    letterSpacing: '0.12em',
                                    backgroundColor: method === m ? '#1a1209' : 'transparent',
                                    color: method === m ? '#fdf8f0' : '#8a7a65',
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
                                    {method === 'code' && <Key size={16} style={{ color: '#d4a574' }} />}
                                    {method === 'email' && <Mail size={16} style={{ color: '#d4a574' }} />}
                                    {method === 'phone' && <Phone size={16} style={{ color: '#d4a574' }} />}
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
                                        backgroundColor: '#f5ede0',
                                        border: error ? '1.5px solid #d4183d' : '1.5px solid transparent',
                                        color: '#1a1209',
                                        fontSize: '0.9rem',
                                    }}
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 text-sm"
                                    style={{ color: '#d4183d' }}
                                >
                                    {error}
                                </motion.p>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={loading || !value.trim()}
                                className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
                                style={{
                                    backgroundColor: '#1a1209',
                                    color: '#fdf8f0',
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
                        <Lock size={12} style={{ color: '#c4b49e' }} />
                        <p className="text-xs" style={{ color: '#c4b49e' }}>
                            Your information is private and secure.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}