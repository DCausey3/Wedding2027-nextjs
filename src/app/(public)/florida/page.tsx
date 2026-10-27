"use client";

import { motion } from 'motion/react';
import Link from "next/link";
import Image from "next/image";
import {
    MapPin, Calendar, Clock, Shirt, Plane, Car, Hotel, Sparkles, CheckCircle2,
    Navigation, Umbrella, Sun, Footprints, CloudSun, ShieldCheck,
} from 'lucide-react';
import { CountdownTimer } from '../../../components/ui/CountdownTimer';
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocalizedDate } from "@/lib/utils";

// ─── Wedding details ────────────────────────────────────────────────────────
const FLORIDA_DATE = new Date('2027-04-24T18:00:00'); // 6:00 PM
const VENUE_NAME = 'Baughman Center';
const VENUE_ADDRESS = '982 Museum Road, Gainesville, FL 32611';
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Baughman+Center+982+Museum+Road+Gainesville+FL';

// Add a photo of the Baughman Center to /public and set the path here (for example '/baughman-center.jpg').
// Leave it empty to use a gradient hero until then.
const VENUE_PHOTO = '/baughman-center.jpg';

// Palette — Greenery + Apricot + Sky + Ivory + Sand
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F5EDE0";
const APRICOT = "#FFB482";
const APRICOT_LIGHT = "#FFF1E5";
const GREENERY = "#7FAA6E";
const GREEN_LIGHT = "#EEF5EA";

// ─── Content ────────────────────────────────────────────────────────────────
const atAGlance = [
    { icon: Calendar, label: 'Date', value: 'April 24, 2027' },
    { icon: Clock, label: 'Time', value: '6:00 PM ET' },
    { icon: MapPin, label: 'Venue', value: VENUE_NAME },
    { icon: Shirt, label: 'Dress Code', value: 'Black tie / formal' },
];

type FloridaCopy = {
    date: string;
    time: string;
    bannerTitle: string;
    bannerBody: string;
    intimateTitle: string;
    intimateBody: string;
    glanceLabels: string[];
    route: { title: string; tag: string; body: string }[];
    airportNames: string[];
    airportBadges: string[];
    airportPoints: string[][];
    hotels: { name: string; note: string }[];
    hotelNote: string;
    packing: { label: string; note: string }[];
    checklist: string[];
    sectionTitles: { overline: string; title: string; italic: string }[];
    directions: string;
    cta: string;
    ctaBody: string;
    rsvp: string;
};

const COPY_EN: FloridaCopy = {
    date: "April 24, 2027",
    time: "6:00 PM ET",
    bannerTitle: "More travel info coming soon!",
    bannerBody: "Hotel blocks and transportation details are on the way. Here are the basics so you can start planning.",
    intimateTitle: "A Small, Intimate Celebration 💛",
    intimateBody: "A micro-intimate gathering with our closest family and friends, right by Lake Alice on the University of Florida campus. We're so glad you're part of it.",
    glanceLabels: ["Date", "Time", "Venue", "Dress Code"],
    route: [
        { title: "Fly into Gainesville", tag: "GNV", body: "The closest and easiest airport." },
        { title: "Rental car or rideshare", tag: "15 to 20 min", body: "From GNV to campus." },
        { title: "Check in near campus", tag: "Book early", body: "Hotels fill up on busy weekends." },
        { title: "Celebrate!", tag: "April 24", body: "Arrive the day before if you can." },
    ],
    airportNames: ["Gainesville Regional", "Jacksonville", "Orlando or Tampa"],
    airportBadges: ["Best bet", "More flights", "Big hubs"],
    airportPoints: [
        ["About 15 to 20 minutes away", "Rideshare or rental car"],
        ["About 1 hr 15 min drive", "Rental car recommended"],
        ["About 2 hr drive", "Rental car recommended"],
    ],
    hotels: [
        { name: "Hilton University of Florida Conference Center", note: "1714 SW 34th St · short drive from the venue" },
        { name: "Hilton Garden Inn Gainesville", note: "Near Butler Plaza and Celebration Pointe" },
        { name: "Sweetwater Branch Inn", note: "Historic bed and breakfast downtown" },
    ],
    hotelNote: "These are ideas for booking on your own. Official room blocks are coming soon.",
    packing: [
        { label: "Formal attire", note: "Black tie / formal" },
        { label: "Comfy shoes", note: "Campus walking" },
        { label: "A light layer", note: "Cool indoor AC" },
        { label: "Umbrella", note: "Spring showers" },
        { label: "Sunscreen", note: "Warm and sunny" },
        { label: "Parking plan", note: "Parking is limited" },
    ],
    checklist: [
        "Book your hotel early. University weekends fill up fast",
        "Parking at the venue is limited, so carpool or rideshare",
        "Plan to arrive the day before",
        "Check the forecast a few days before you travel",
        "Choose free-cancellation rates in case plans change",
    ],
    sectionTitles: [
        { overline: "The Basics", title: "At a", italic: "Glance" },
        { overline: "Getting There", title: "Your", italic: "Route" },
        { overline: "Where To Land", title: "Choose Your", italic: "Airport" },
        { overline: "Rest Your Head", title: "Where to", italic: "Stay" },
        { overline: "Don't Forget", title: "Pack", italic: "Smart" },
        { overline: "Your Checklist", title: "Before You", italic: "Go" },
    ],
    directions: "Get Directions",
    cta: "Ready to celebrate in Gainesville?",
    ctaBody: "Review the travel information on this page, then RSVP.",
    rsvp: "RSVP for Florida",
};

const COPY_ES: typeof COPY_EN = {
    date: "24 de abril de 2027",
    time: "6:00 p. m. ET",
    bannerTitle: "¡Pronto compartiremos más información de viaje!",
    bannerBody: "Pronto tendremos información sobre bloques de habitaciones y transporte. Por ahora, estos son los datos básicos para empezar a planear.",
    intimateTitle: "Una celebración pequeña e íntima 💛",
    intimateBody: "Una reunión íntima con nuestra familia y amistades más cercanas, junto al lago Alice, en el campus de la Universidad de Florida. Nos alegra mucho que seas parte.",
    glanceLabels: ["Fecha", "Hora", "Lugar", "Vestimenta"],
    route: [
        { title: "Vuela a Gainesville", tag: "GNV", body: "Es el aeropuerto más cercano y práctico." },
        { title: "Alquila un auto o usa transporte por aplicación", tag: "15 a 20 min", body: "Desde GNV hasta el campus." },
        { title: "Hospédate cerca del campus", tag: "Reserva pronto", body: "Los hoteles se llenan los fines de semana concurridos." },
        { title: "¡A celebrar!", tag: "24 de abril", body: "Si puedes, llega el día anterior." },
    ],
    airportNames: ["Aeropuerto Regional de Gainesville", "Jacksonville", "Orlando o Tampa"],
    airportBadges: ["Mejor opción", "Más vuelos", "Grandes centros"],
    airportPoints: [
        ["A unos 15 o 20 minutos", "Transporte por aplicación o auto de alquiler"],
        ["A 1 hora y 15 minutos en auto", "Se recomienda alquilar un auto"],
        ["A unas 2 horas en auto", "Se recomienda alquilar un auto"],
    ],
    hotels: [
        { name: "Hilton University of Florida Conference Center", note: "1714 SW 34th St · A poca distancia en auto del lugar de la boda" },
        { name: "Hilton Garden Inn Gainesville", note: "Cerca de Butler Plaza y Celebration Pointe" },
        { name: "Sweetwater Branch Inn", note: "Hotel histórico tipo bed and breakfast en el centro" },
    ],
    hotelNote: "Estas son opciones para reservar por tu cuenta. Pronto compartiremos los bloques oficiales de habitaciones.",
    packing: [
        { label: "Vestimenta formal", note: "Etiqueta rigurosa / formal" },
        { label: "Zapatos cómodos", note: "Para caminar por el campus" },
        { label: "Una chaqueta ligera", note: "El aire acondicionado puede ser frío" },
        { label: "Paraguas", note: "Lluvias de primavera" },
        { label: "Protector solar", note: "Clima cálido y soleado" },
        { label: "Plan de estacionamiento", note: "El estacionamiento es limitado" },
    ],
    checklist: [
        "Reserva el hotel pronto; los fines de semana universitarios se llenan rápido",
        "El estacionamiento es limitado; comparte auto o usa transporte por aplicación",
        "Planea llegar el día anterior",
        "Consulta el pronóstico unos días antes del viaje",
        "Elige tarifas con cancelación gratuita por si cambian tus planes",
    ],
    sectionTitles: [
        { overline: "Lo esencial", title: "De un", italic: "vistazo" },
        { overline: "Cómo llegar", title: "Tu", italic: "ruta" },
        { overline: "Dónde aterrizar", title: "Elige tu", italic: "aeropuerto" },
        { overline: "Dónde hospedarte", title: "Dónde", italic: "alojarte" },
        { overline: "No olvides", title: "Empaca con", italic: "inteligencia" },
        { overline: "Tu lista", title: "Antes de", italic: "viajar" },
    ],
    directions: "Cómo llegar",
    cta: "¿Listos para celebrar en Gainesville?",
    ctaBody: "Consulta la información de viaje en esta página y confirma tu asistencia.",
    rsvp: "Confirmar asistencia en Florida",
};

const route = [
    { icon: Plane, title: 'Fly into Gainesville', tag: 'GNV', body: 'The closest and easiest airport.' },
    { icon: Car, title: 'Rental car or rideshare', tag: '15 to 20 min', body: 'From GNV to campus.' },
    { icon: Hotel, title: 'Check in near campus', tag: 'Book early', body: 'Hotels fill up on busy weekends.' },
    { icon: Sparkles, title: 'Celebrate!', tag: 'April 24', body: 'Arrive the day before if you can.' },
];

const airports = [
    { code: 'GNV', name: 'Gainesville Regional', badge: 'Best bet', points: ['About 15 to 20 minutes away', 'Rideshare or rental car'] },
    { code: 'JAX', name: 'Jacksonville', badge: 'More flights', points: ['About 1 hr 15 min drive', 'Rental car recommended'] },
    { code: 'MCO · TPA', name: 'Orlando or Tampa', badge: 'Big hubs', points: ['About 2 hr drive', 'Rental car recommended'] },
];

const stay = [
    { name: 'Hilton University of Florida Conference Center', note: '1714 SW 34th St · short drive from the venue' },
    { name: 'Hilton Garden Inn Gainesville', note: 'Near Butler Plaza and Celebration Pointe' },
    { name: 'Sweetwater Branch Inn', note: 'Historic bed and breakfast downtown' },
];

const packList = [
    { icon: Shirt, label: 'Formal attire', note: 'Black tie / formal' },
    { icon: Footprints, label: 'Comfy shoes', note: 'Campus walking' },
    { icon: CloudSun, label: 'A light layer', note: 'Cool indoor AC' },
    { icon: Umbrella, label: 'Umbrella', note: 'Spring showers' },
    { icon: Sun, label: 'Sunscreen', note: 'Warm and sunny' },
    { icon: Car, label: 'Parking plan', note: 'Parking is limited' },
];

const checklist = [
    { icon: Hotel, text: 'Book your hotel early. University weekends fill up fast' },
    { icon: Car, text: 'Parking at the venue is limited, so carpool or rideshare' },
    { icon: Calendar, text: 'Plan to arrive the day before' },
    { icon: CloudSun, text: 'Check the forecast a few days before you travel' },
    { icon: ShieldCheck, text: 'Choose free-cancellation rates in case plans change' },
];

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
            <p className="uppercase tracking-widest mb-3" style={{ color: GREENERY, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                {overline}
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 300, color: SKY_DEEP, lineHeight: 1.1 }}>
                {title} <span style={{ fontStyle: 'italic', color: APRICOT }}>{italic}</span>
            </h2>
        </motion.div>
    );
}

export default function FloridaPage() {
    const { lang } = useLanguage();
    const copy = lang === "es" ? COPY_ES : COPY_EN;
    const weddingDate = formatLocalizedDate(FLORIDA_DATE, lang);
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* ─── Hero ─── */}
            <div className="relative h-screen min-h-[600px] overflow-hidden flex items-end pb-24">
                {VENUE_PHOTO ? (
                    <Image
                        src={VENUE_PHOTO}
                        alt="Baughman Center, Gainesville, Florida"
                        fill
                        priority
                        className="object-cover"
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #2c5a4a 55%, ${GREENERY} 100%)` }}
                    />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,59,84,0.8) 0%, rgba(18,59,84,0.15) 60%, rgba(18,59,84,0) 100%)' }} />
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${GREENERY}, ${APRICOT})` }} />
                <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
                        <p className="uppercase tracking-widest mb-3" style={{ color: APRICOT, fontSize: '0.6rem', letterSpacing: '0.3em' }}>
                            {lang === "es" ? "Boda en Florida 🇺🇸" : "Florida Wedding 🇺🇸"}
                        </p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 300, color: IVORY, lineHeight: 1.0 }}>
                            Gainesville,
                            <br />
                            <span style={{ fontStyle: 'italic', color: APRICOT }}>Florida</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>{weddingDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>{VENUE_NAME}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} style={{ color: APRICOT }} />
                                <span className="text-sm" style={{ color: IVORY }}>{copy.time}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ─── Countdown ─── */}
            <div className="py-10 px-6 flex flex-col items-center" style={{ background: `linear-gradient(to right, ${SKY_DEEP}, ${GREENERY})` }}>
                <p className="uppercase tracking-widest mb-4" style={{ color: 'rgba(255,247,236,0.75)', fontSize: '0.55rem', letterSpacing: '0.3em' }}>
                    {lang === "es" ? "Cuenta regresiva para Florida" : "Counting Down To Florida"}
                </p>
                <CountdownTimer targetDate={FLORIDA_DATE} textColor={IVORY} accentColor={APRICOT} size="lg" />
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

            {/* ─── Intimate notice ─── */}
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
                        {copy.intimateTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.75 }}>
                        {copy.intimateBody}
                    </p>
                </motion.div>
            </section>

            {/* ─── At a glance ─── */}
            <section className="py-16 px-6" style={{ backgroundColor: SAND_LIGHT }}>
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
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <div className="w-11 h-11 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: GREENERY }}>
                                    <item.icon size={18} style={{ color: IVORY }} />
                                </div>
                                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: GREENERY, letterSpacing: '0.12em' }}>{copy.glanceLabels[i]}</p>
                                <p className="text-sm font-medium" style={{ color: SKY_DEEP }}>{i === 0 ? weddingDate : i === 1 ? copy.time : item.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-sm text-center" style={{ color: SKY_DEEP, opacity: 0.8 }}>
                            <MapPin size={14} className="inline mr-1" style={{ color: APRICOT }} />
                            {VENUE_ADDRESS}
                        </p>
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                            style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: '0.15em' }}
                        >
                            <Navigation size={12} /> {copy.directions}
                        </a>
                    </div>
                </div>
            </section>

            {/* ─── Your route ─── */}
            <section className="py-20 px-6">
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
                                style={{ backgroundColor: GREEN_LIGHT, border: `1px solid ${GREENERY}55` }}
                            >
                                <span
                                    className="absolute -top-3 left-5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                                    style={{ backgroundColor: APRICOT, color: SKY_DEEP }}
                                >
                                    {i + 1}
                                </span>
                                <step.icon size={22} style={{ color: GREENERY }} className="mb-3" />
                                <h3 className="font-serif text-lg mb-1" style={{ color: SKY_DEEP }}>{copy.route[i].title}</h3>
                                <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ backgroundColor: IVORY, color: SKY_DEEP }}>
                                    {copy.route[i].tag}
                                </span>
                                <p className="text-sm" style={{ color: `${SKY_DEEP}99` }}>{copy.route[i].body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Airports ─── */}
            <section className="py-20 px-6" style={{ backgroundColor: SAND_LIGHT }}>
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
                                style={{ backgroundColor: IVORY, border: i === 0 ? `2px solid ${APRICOT}` : `1px solid ${SAND}` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: SKY_DEEP, color: APRICOT, letterSpacing: '0.08em' }}>
                                        {a.code}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: i === 0 ? APRICOT : GREEN_LIGHT, color: SKY_DEEP }}>
                                        {copy.airportBadges[i]}
                                    </span>
                                </div>
                                <h3 className="font-serif text-lg mb-3" style={{ color: SKY_DEEP }}>                                {copy.airportNames[i]}</h3>
                                <ul className="space-y-1.5">
                                    {a.points.map((p, pointIndex) => (
                                        <li key={p} className="flex items-start gap-2 text-sm" style={{ color: `${SKY_DEEP}cc` }}>
                                            <CheckCircle2 size={14} style={{ color: GREENERY, marginTop: 3, flexShrink: 0 }} />
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
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <SectionTitle {...copy.sectionTitles[3]} />
                    <div className="grid gap-3">
                        {stay.map((h, i) => (
                            <motion.div
                                key={h.name}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: GREEN_LIGHT, border: `1px solid ${GREENERY}55` }}
                            >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: APRICOT }}>
                                    <Hotel size={16} style={{ color: SKY_DEEP }} />
                                </div>
                                <div>
                                    <p className="font-serif text-base" style={{ color: SKY_DEEP }}>{h.name}</p>
                                    <p className="text-xs mt-0.5" style={{ color: `${SKY_DEEP}99` }}>{copy.hotels[i].note}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-center text-xs mt-5" style={{ color: `${SKY_DEEP}99` }}>
                        {copy.hotelNote}
                    </p>
                </div>
            </section>

            {/* ─── Pack smart ─── */}
            <section className="py-20 px-6" style={{ backgroundColor: SAND_LIGHT }}>
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
                                style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
                            >
                                <p.icon size={22} style={{ color: GREENERY }} className="mx-auto mb-2" />
                                <p className="text-sm font-medium" style={{ color: SKY_DEEP }}>{copy.packing[i].label}</p>
                                <p className="text-xs mt-0.5" style={{ color: `${SKY_DEEP}99` }}>{copy.packing[i].note}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Before you go ─── */}
            <section className="py-20 px-6">
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
                                <c.icon size={18} style={{ color: GREENERY, flexShrink: 0 }} />
                                <p className="text-sm" style={{ color: SKY_DEEP }}>{copy.checklist[i]}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ─── */}
            <section className="py-20 px-6" style={{ background: `linear-gradient(135deg, ${SKY_DEEP} 0%, #2c5a4a 50%, ${GREENERY} 100%)` }}>
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <Sparkles size={32} className="mx-auto mb-6" style={{ color: 'rgba(255,247,236,0.7)' }} />
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