"use client";

import { motion } from 'motion/react';
import Link from "next/link";
import Image from "next/image";
import {
    MapPin, Calendar, Plane, Bus, Car, Hotel, Mountain, Languages, FileText,
    Clock, Luggage, CloudRain, Sun, Footprints, Shirt, Sparkles, CheckCircle2, Smartphone, ShieldCheck,
} from 'lucide-react';
import { CountdownTimer } from '../../../components/ui/CountdownTimer';
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocalizedDate } from "@/lib/utils";

// ─── Wedding details ────────────────────────────────────────────────────────
const COLOMBIA_DATE = new Date('2027-06-12T18:00:00');
const VENUE_NAME = 'Hacienda Linedaraja'; // confirm spelling
const VENUE_CITY = 'Manizales, Colombia';

// Add your venue photo to /public and set the path here (for example '/hacienda.jpg').
// Leave it empty to use the placeholder photo.
const VENUE_PHOTO = '/lin.jpeg';

const PLACEHOLDER_HERO = 'https://images.unsplash.com/photo-1643068730310-e8cff093b7ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHx0cm9waWNhbCUyMGRlc3RpbmF0aW9uJTIwd2VkZGluZyUyMENvbG9tYmlhJTIwbHV4dXJ5fGVufDF8fHx8MTc4MDA4NTk2NXww&ixlib=rb-4.1.0&q=80&w=1080';

// Palette — Sky Blue + Apricot + Ivory + Sand
const SKY_DEEP = "#123B54";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";
const SKY_LIGHT = "#EAF5FD";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F5EDE0";
const APRICOT = "#FFB482";

// ─── Content ────────────────────────────────────────────────────────────────
const atAGlance = [
    { icon: Calendar, label: 'Date', value: 'June 12, 2027' },
    { icon: MapPin, label: 'Venue', value: VENUE_NAME },
    { icon: Mountain, label: 'City', value: 'Manizales' },
    { icon: Languages, label: 'Ceremony', value: 'Bilingual' },
];

const route = [
    { icon: Plane, title: 'Fly to Pereira', tag: 'PEI', body: 'Connecting flights are common.' },
    { icon: Bus, title: 'Hop on a bus', tag: '~1 to 1.5 hrs', body: "Pereira's bus terminal to Manizales' bus terminal." },
    { icon: Car, title: 'Taxi to your hotel', tag: 'In town', body: 'Taxis and rideshare in Manizales.' },
    { icon: Sparkles, title: 'Celebrate!', tag: 'June 12', body: 'Arrive at least one day early.' },
];

const airports = [
    { code: 'PEI', name: 'Pereira', badge: 'Best bet', points: ['About 1 hour from Manizales', 'Bus, taxi, or private transfer'] },
    { code: 'MZL', name: 'Manizales (La Nubia)', badge: 'Closest to town', points: ['Domestic flights only', 'Connect via Bogotá or Medellín'] },
    { code: 'MDE · BOG', name: 'Medellín or Bogotá', badge: 'Connection hubs', points: ['Many international flights', 'Then a short domestic hop'] },
];

const stay = [
    { icon: Hotel, text: 'Manizales is the closest city to the venue' },
    { icon: Sparkles, text: 'Official hotel picks and room blocks coming soon' },
    { icon: ShieldCheck, text: 'Booking now? Choose a free-cancellation rate' },
];

const packList = [
    { icon: Shirt, label: 'Layers', note: 'Mild days, cool evenings' },
    { icon: CloudRain, label: 'Rain jacket', note: 'Showers happen' },
    { icon: Footprints, label: 'Comfy shoes', note: 'Garden terrain' },
    { icon: Sun, label: 'Sunscreen', note: 'Strong sun at altitude' },
    { icon: Luggage, label: 'Festive attire', note: 'Tropical formal' },
    { icon: FileText, label: 'Passport', note: 'Keep it with you' },
];

const checklist = [
    { icon: FileText, text: 'Passport valid 6+ months past the wedding (no visa under 90 days)' },
    { icon: Calendar, text: 'Plan to land at least 1 day before June 12' },
    { icon: Languages, text: 'Learn a little Spanish. Duolingo helps! 🦉' },
    { icon: Smartphone, text: 'Set up an international plan or travel eSIM' },
    { icon: ShieldCheck, text: 'Consider travel insurance' },
    { icon: Clock, text: 'Altitude is about 7,000 ft, so take it easy day one' },
];

type ColombiaCopy = {
    dateShort: string;
    heroIntro: string;
    countdown: string;
    bannerTitle: string;
    bannerBody: string;
    glanceLabels: string[];
    route: { title: string; tag: string; body: string }[];
    airportBadges: string[];
    airportPoints: string[][];
    stay: string[];
    packing: { label: string; note: string }[];
    checklist: string[];
    sectionTitles: { overline: string; title: string; italic: string }[];
    doorToDoor: string;
    cta: string;
    ctaBody: string;
    rsvp: string;
};

const COPY_EN: ColombiaCopy = {
    dateShort: "June 12",
    heroIntro: "See you in",
    countdown: "Counting Down",
    bannerTitle: "More travel info coming soon!",
    bannerBody: "Hotel blocks, shuttles, and flight tips are on the way. Here are the basics so you can start planning.",
    glanceLabels: ["Date", "Venue", "City", "Ceremony"],
    route: [
        { title: "Fly to Pereira", tag: "PEI", body: "Connecting flights are common." },
        { title: "Hop on a bus", tag: "~1 to 1.5 hrs", body: "Pereira's bus terminal to Manizales' bus terminal." },
        { title: "Taxi to your hotel", tag: "In town", body: "Taxis and rideshare in Manizales." },
        { title: "Celebrate!", tag: "June 12", body: "Arrive at least one day early." },
    ],
    airportBadges: ["Best bet", "Closest to town", "Connection hubs"],
    airportPoints: [
        ["About 1 hour from Manizales", "Bus, taxi, or private transfer"],
        ["Domestic flights only", "Connect via Bogotá or Medellín"],
        ["Many international flights", "Then a short domestic hop"],
    ],
    stay: ["Manizales is the closest city to the venue", "Official hotel picks and room blocks coming soon", "Booking now? Choose a free-cancellation rate"],
    packing: [
        { label: "Layers", note: "Mild days, cool evenings" },
        { label: "Rain jacket", note: "Showers happen" },
        { label: "Comfy shoes", note: "Garden terrain" },
        { label: "Sunscreen", note: "Strong sun at altitude" },
        { label: "Festive attire", note: "Tropical formal" },
        { label: "Passport", note: "Keep it with you" },
    ],
    checklist: [
        "Passport valid 6+ months past the wedding (no visa under 90 days)",
        "Plan to land at least 1 day before June 12",
        "Learn a little Spanish. Duolingo helps! 🦉",
        "Set up an international plan or travel eSIM",
        "Consider travel insurance",
        "Altitude is about 7,000 ft, so take it easy day one",
    ],
    sectionTitles: [
        { overline: "The Basics", title: "At a", italic: "Glance" },
        { overline: "Getting There", title: "Your", italic: "Route" },
        { overline: "Where To Land", title: "Choose Your", italic: "Airport" },
        { overline: "Rest Your Head", title: "Where to", italic: "Stay" },
        { overline: "Don't Forget", title: "Pack", italic: "Smart" },
        { overline: "Your Checklist", title: "Before You", italic: "Go" },
    ],
    doorToDoor: "Prefer door to door? A private transfer or taxi from Pereira airport works too (about 1 hour).",
    cta: "Ready to join the fiesta?",
    ctaBody: "Review the travel information on this page, then RSVP.",
    rsvp: "RSVP for Colombia",
};

const COPY_ES: typeof COPY_EN = {
    dateShort: "12 de junio",
    heroIntro: "Nos vemos en",
    countdown: "Cuenta regresiva",
    bannerTitle: "¡Pronto compartiremos más información de viaje!",
    bannerBody: "Pronto tendremos información sobre hoteles, transporte y vuelos. Por ahora, estos son los datos básicos para empezar a planear.",
    glanceLabels: ["Fecha", "Lugar", "Ciudad", "Ceremonia"],
    route: [
        { title: "Vuela a Pereira", tag: "PEI", body: "Es común hacer conexiones." },
        { title: "Toma un autobús", tag: "De 1 a 1,5 horas", body: "Desde la terminal de Pereira hasta la terminal de Manizales." },
        { title: "Toma un taxi al hotel", tag: "En la ciudad", body: "Hay taxis y transporte por aplicación en Manizales." },
        { title: "¡A celebrar!", tag: "12 de junio", body: "Llega al menos un día antes." },
    ],
    airportBadges: ["La mejor opción", "Más cerca de la ciudad", "Centros de conexión"],
    airportPoints: [
        ["Aproximadamente a una hora de Manizales", "Autobús, taxi o traslado privado"],
        ["Solo vuelos nacionales", "Conexión en Bogotá o Medellín"],
        ["Muchos vuelos internacionales", "Después, un vuelo nacional corto"],
    ],
    stay: ["Manizales es la ciudad más cercana al lugar de la boda", "Pronto compartiremos hoteles recomendados y bloques de habitaciones", "¿Vas a reservar? Elige una tarifa con cancelación gratuita"],
    packing: [
        { label: "Ropa en capas", note: "Días templados y noches frescas" },
        { label: "Chaqueta para la lluvia", note: "Puede llover" },
        { label: "Zapatos cómodos", note: "Terreno de jardín" },
        { label: "Protector solar", note: "Sol intenso por la altura" },
        { label: "Vestimenta festiva", note: "Formal tropical" },
        { label: "Pasaporte", note: "Llévalo contigo" },
    ],
    checklist: [
        "Pasaporte vigente al menos 6 meses después de la boda (no se requiere visa para estadías menores a 90 días)",
        "Planea llegar al menos un día antes del 12 de junio",
        "Aprende un poco de español. ¡Duolingo ayuda! 🦉",
        "Activa un plan internacional o una eSIM de viaje",
        "Considera contratar un seguro de viaje",
        "La altura es de unos 2.100 metros; tómalo con calma el primer día",
    ],
    sectionTitles: [
        { overline: "Lo esencial", title: "De un", italic: "vistazo" },
        { overline: "Cómo llegar", title: "Tu", italic: "ruta" },
        { overline: "Dónde aterrizar", title: "Elige tu", italic: "aeropuerto" },
        { overline: "Dónde hospedarte", title: "Dónde", italic: "alojarte" },
        { overline: "No olvides", title: "Empaca con", italic: "inteligencia" },
        { overline: "Tu lista", title: "Antes de", italic: "viajar" },
    ],
    doorToDoor: "¿Prefieres ir directamente? También puedes tomar un traslado privado o taxi desde el aeropuerto de Pereira (aproximadamente una hora).",
    cta: "¿Listos para celebrar la fiesta?",
    ctaBody: "Consulta la información de viaje en esta página y confirma tu asistencia.",
    rsvp: "Confirmar asistencia a Colombia",
};

// ─── Small pieces ───────────────────────────────────────────────────────────
function SectionTitle({ overline, title, italic }: { overline: string; title: string; italic: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
        >
            <p className="uppercase tracking-widest mb-3" style={{ color: SKY_MID, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                {overline}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 300, color: SKY_DEEP, lineHeight: 1.1 }}>
                {title} <span style={{ fontStyle: 'italic', color: APRICOT }}>{italic}</span>
            </h2>
        </motion.div>
    );
}

export default function ColombiaPage() {
    const { lang } = useLanguage();
    const copy = lang === "es" ? COPY_ES : COPY_EN;
    const weddingDate = formatLocalizedDate(COLOMBIA_DATE, lang);
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* ─── Hero ─── */}
            <div className="relative h-screen min-h-[600px] overflow-hidden flex items-end pb-24">
                <Image
                    src={VENUE_PHOTO || PLACEHOLDER_HERO}
                    alt={`${VENUE_NAME}, ${VENUE_CITY}`}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,59,84,0.8) 0%, rgba(18,59,84,0.15) 60%, rgba(18,59,84,0) 100%)' }} />
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${SKY_MID}, ${APRICOT})` }} />
                <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        <p className="uppercase tracking-widest mb-3" style={{ color: SKY, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            {lang === "es" ? "Boda en Colombia 🇨🇴" : "Colombia Wedding 🇨🇴"}
                        </p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 300, color: IVORY, lineHeight: 1.0 }}>
                            {copy.heroIntro} <span style={{ fontStyle: 'italic', color: APRICOT }}>Colombia</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} style={{ color: SKY }} />
                                <span className="text-sm" style={{ color: IVORY }}>{VENUE_NAME} · {VENUE_CITY}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: SKY }} />
                                <span className="text-sm" style={{ color: IVORY }}>{weddingDate}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Countdown ─── */}
            <div className="py-10 px-6 flex flex-col items-center text-center" style={{ background: `linear-gradient(to right, ${SKY_DEEP}, ${SKY_MID})` }}>
                <p className="uppercase tracking-widest mb-4" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.55rem', letterSpacing: '0.3em' }}>
                    {copy.countdown}
                </p>
                <CountdownTimer targetDate={COLOMBIA_DATE} textColor={IVORY} accentColor={SKY} size="lg" />
            </div>

            {/* ─── Coming-soon banner ─── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="px-6 py-5 flex flex-wrap items-center justify-center gap-3 text-center"
                style={{ background: `linear-gradient(to right, ${APRICOT}, #FFC9A3)`, color: SKY_DEEP }}
            >
                <Sparkles size={16} />
                <p className="text-sm">
                    <strong>{copy.bannerTitle}</strong> {copy.bannerBody}
                </p>
            </motion.div>

            {/* ─── At a glance ─── */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[0]} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {atAGlance.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="p-5 rounded-2xl text-center"
                                style={{ backgroundColor: SKY_LIGHT, border: `1px solid ${SKY}` }}
                            >
                                <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: SKY_MID }}>
                                    <item.icon size={18} style={{ color: IVORY }} />
                                </div>
                                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: SKY_MID, letterSpacing: '0.12em' }}>{copy.glanceLabels[i]}</p>
                                <p className="text-sm font-medium" style={{ color: SKY_DEEP }}>{i === 0 ? weddingDate : item.value}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Your route ─── */}
            <section className="py-20 px-6" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="max-w-5xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[1]} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {route.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative p-6 rounded-2xl"
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <span
                                    className="absolute -top-3 left-5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                                    style={{ backgroundColor: APRICOT, color: SKY_DEEP }}
                                >
                                    {i + 1}
                                </span>
                                <step.icon size={22} style={{ color: SKY_MID }} className="mb-3" />
                                <h3 className="font-serif text-lg mb-1" style={{ color: SKY_DEEP }}>{copy.route[i].title}</h3>
                                <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ backgroundColor: SKY_LIGHT, color: SKY_DEEP }}>
                                    {i === 3 ? copy.dateShort : copy.route[i].tag}
                                </span>
                                <p className="text-sm" style={{ color: `${SKY_DEEP}99` }}>{copy.route[i].body}</p>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-xs mt-6" style={{ color: `${SKY_DEEP}99` }}>{copy.doorToDoor}</p>
                </div>
            </section>

            {/* ─── Airports ─── */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[2]} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {airports.map((a, i) => (
                            <motion.div
                                key={a.code}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="p-6 rounded-2xl"
                                style={{ backgroundColor: SKY_LIGHT, border: i === 0 ? `2px solid ${APRICOT}` : `1px solid ${SKY}` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: SKY_DEEP, color: APRICOT, letterSpacing: '0.08em' }}>
                                        {a.code}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: i === 0 ? APRICOT : IVORY, color: SKY_DEEP }}>
                                        {copy.airportBadges[i]}
                                    </span>
                                </div>
                                <h3 className="font-serif text-lg mb-3" style={{ color: SKY_DEEP }}>{a.name}</h3>
                                <ul className="space-y-1.5">
                                    {a.points.map((p, pointIndex) => (
                                        <li key={p} className="flex items-start gap-2 text-sm" style={{ color: `${SKY_DEEP}cc` }}>
                                            <CheckCircle2 size={14} style={{ color: SKY_MID, marginTop: 3, flexShrink: 0 }} />
                                            {copy.airportPoints[i][pointIndex]}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Where to stay ─── */}
            <section className="py-20 px-6" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="max-w-3xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[3]} />
                    <div className="grid gap-3">
                        {stay.map((s, i) => (
                            <motion.div
                                key={s.text}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: APRICOT }}>
                                    <s.icon size={16} style={{ color: SKY_DEEP }} />
                                </div>
                                <p className="text-sm" style={{ color: SKY_DEEP }}>{copy.stay[i]}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pack smart ─── */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[4]} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {packList.map((p, i) => (
                            <motion.div
                                key={p.label}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                className="p-5 rounded-2xl text-center"
                                style={{ backgroundColor: SKY_LIGHT, border: `1px solid ${SKY}` }}
                            >
                                <p.icon size={22} style={{ color: SKY_MID }} className="mx-auto mb-2" />
                                <p className="text-sm font-medium" style={{ color: SKY_DEEP }}>{copy.packing[i].label}</p>
                                <p className="text-xs mt-0.5" style={{ color: `${SKY_DEEP}99` }}>{copy.packing[i].note}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Before you go ─── */}
            <section className="py-20 px-6" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="max-w-3xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[5]} />
                    <div className="grid gap-3">
                        {checklist.map((c, i) => (
                            <motion.div
                                key={c.text}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <c.icon size={18} style={{ color: SKY_MID, flexShrink: 0 }} />
                                <p className="text-sm" style={{ color: SKY_DEEP }}>{copy.checklist[i]}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, ${SKY_MID} 50%, ${SKY} 100%)` }}>
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <Plane size={32} className="mx-auto mb-6" style={{ color: 'rgba(255,247,236,0.7)' }} />
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 300, color: IVORY, lineHeight: 1.1 }}>
                            {copy.cta}
                        </h2>
                        <p className="mt-4 mb-8" style={{ color: 'rgba(255,247,236,0.8)', fontSize: '0.9rem' }}>
                            {copy.ctaBody}
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/rsvp"
                                className="px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:bg-white/10"
                                style={{ border: '1px solid rgba(255,247,236,0.5)', color: IVORY, letterSpacing: '0.2em' }}
                            >
                                {copy.rsvp}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}