"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, MapPin, Calendar, Gift, Mail } from "lucide-react";
import { CountdownTimer } from "../../components/ui/CountdownTimer";
import { formatLocalizedDate, WEDDING_DATES } from "../../lib/utils";
import { useLanguage } from "../providers/LanguageProvider";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54"; // deep shade of the sky-blue hue — replaces navy everywhere
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const PEACH = "#FFE4CB";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3"; // mid accent — icons, secondary labels
const GREENERY = "#7FAA6E";
const GREENERY_DARK = "#4d6b43"; // higher-contrast variant of GREENERY for text on light bg

// ─── Shared guest hook ─────────────────────────────────────────────────────
// Attendance now comes straight from Supabase (std_attending_colombia /
// std_attending_florida) instead of a single "selectedWedding" choice.
// NOTE: the API route maps these snake_case DB columns to camelCase
// (stdAttendingColombia / stdAttendingFlorida) before they ever reach the
// client — the guest object in sessionStorage uses the camelCase names.
type Guest = {
    firstName?: string;
    plusOneCount?: number;
    email?: string;
    phone?: string;
    stdAttendingColombia?: boolean;
    stdAttendingFlorida?: boolean;
};

function useGuest() {
    const [guest, setGuest] = useState<Guest | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setGuest(parsed);
            } catch (e) {
                console.error("[useGuest] failed to parse guest JSON:", e);
            }
        }
        setLoaded(true);
    }, []);

    return { guest, loaded };
}

// ─── Attendance helper ──────────────────────────────────────────────────────
// Supabase can hand these back as real booleans OR as strings ("TRUE"/"FALSE"/
// "true"/"false") depending on the column type and how the API route
// serializes them, so normalize defensively instead of a strict `=== true`.
function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

function useAttendance(guest: Guest | null) {
    const attendingColombia = isTruthy(guest?.stdAttendingColombia);
    const attendingFlorida = isTruthy(guest?.stdAttendingFlorida);
    const attendingBoth = attendingColombia && attendingFlorida;
    const attendingNeither = !attendingColombia && !attendingFlorida;
    return { attendingColombia, attendingFlorida, attendingBoth, attendingNeither };
}

// ─── Personalized welcome banner ──────────────────────────────────────────
// Navbar is `fixed top-0`, so it doesn't occupy flow space — without an
// offset here, this banner renders at y=0 and sits directly underneath it.
// h-16 (64px) matches the Navbar's fixed height.
function WelcomeBanner({ name }: { name?: string | null }) {
    const { lang } = useLanguage();
    if (!name) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 w-full py-3 px-6 text-center"
            style={{ backgroundColor: SKY_DEEP, borderBottom: "1px solid rgba(255,180,130,0.25)", marginTop: "4rem" }}
        >
            <p className="text-xs uppercase tracking-[0.15em]" style={{ color: PEACH }}>
                {lang === "es" ? "¡Qué bueno tenerte de vuelta," : "Welcome back,"} <span translate="no">{name}</span>{lang === "es" ? "! Nos alegra mucho que estés aquí." : "! We're so glad you're here."}
            </p>
        </motion.div>
    );
}

// ─── Hero with parallax ─────────────────────────────────────────────────────
function HeroSection({
                         attendingColombia,
                         attendingFlorida,
                         attendingBoth,
                     }: {
    attendingColombia: boolean;
    attendingFlorida: boolean;
    attendingBoth: boolean;
}) {
    const { lang } = useLanguage();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // If they're only attending Florida, lead with that countdown.
    // Otherwise (Colombia only, both, or undecided) lead with Colombia since it's earlier.
    const heroCountdown =
        attendingFlorida && !attendingColombia
            ? { date: WEDDING_DATES.usa, label: `Florida — ${formatLocalizedDate(new Date(WEDDING_DATES.usa), lang)}` }
            : { date: WEDDING_DATES.colombia, label: `Colombia — ${formatLocalizedDate(new Date(WEDDING_DATES.colombia), lang)}` };
        
    console.log(heroCountdown);

    return (
        <div ref={ref} className="relative h-screen min-h-[680px] overflow-hidden">
            <motion.div className="absolute inset-0 overflow-hidden" style={{ y, backgroundColor: SKY_DEEP }}>
                <Image
                    src="/treeLean.jpeg"
                    alt="Jhoana & Damariel engagement"
                    fill
                    priority
                    className="object-cover"
                    style={{ objectPosition: "center 80%" }}
                />
                {/* Lighter overlay, concentrated at the bottom/left for text legibility — keeps the photo the focal point */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(18,59,84,0.12) 0%, rgba(18,59,84,0.02) 35%, rgba(18,59,84,0.55) 100%)",
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to right, rgba(18,59,84,0.45) 0%, rgba(18,59,84,0) 55%)",
                    }}
                />
            </motion.div>

            {/* Mobile: full-width countdown bar pinned under the top of the hero — grid instead of scroll so both fit without clipping */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="sm:hidden absolute top-4 inset-x-3 z-20"
            >
                <div
                    className="rounded-2xl px-3 py-3 backdrop-blur-md"
                    style={{ backgroundColor: "rgba(18,59,84,0.55)", border: "1px solid rgba(255,247,236,0.15)" }}
                >
                    {attendingBoth ? (
                        <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,247,236,0.2)" }}>
                            <div className="flex justify-center min-w-0">
                                <CountdownTimer
                                    targetDate={WEDDING_DATES.colombia}
                                    label="Colombia"
                                    textColor={IVORY}
                                    accentColor={SKY}
                                    size="sm"
                                    showSeconds={false}
                                />
                            </div>
                            <div className="flex justify-center min-w-0">
                                <CountdownTimer
                                    targetDate={WEDDING_DATES.usa}
                                    label="Florida"
                                    textColor={IVORY}
                                    accentColor={APRICOT}
                                    size="sm"
                                    showSeconds={false}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <CountdownTimer
                                targetDate={heroCountdown.date}
                                label={heroCountdown.label}
                                textColor={IVORY}
                                accentColor={APRICOT}
                                size="sm"
                                showSeconds={false}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Title block — slides in from the left, anchored lower on the frame */}
            <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-12 pb-14 sm:pb-40 max-w-3xl">
                <motion.p
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
                    className="uppercase tracking-widest mb-4"
                    style={{ color: PEACH, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                >
                    We&apos;re getting married
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(2.4rem, 11vw, 6rem)",
                        fontWeight: 300,
                        color: IVORY,
                        lineHeight: 1.05,
                        letterSpacing: "-0.01em",
                    }}
                >
                    Jhoana
                    <br />
                    <span style={{ fontStyle: "italic", color: PEACH }}>&amp; Damariel</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75, duration: 0.9, ease: "easeOut" }}
                    className="mt-6 flex items-center gap-4"
                >
                    <div className="h-px w-12" style={{ backgroundColor: APRICOT }} />
                    <p className="uppercase tracking-widest" style={{ color: PEACH, fontSize: "0.65rem", letterSpacing: "0.25em" }}>
                        {lang === "es"
                            ? attendingBoth ? "Dos celebraciones, una historia de amor" : "Acompáñanos a celebrar"
                            : attendingBoth ? "Two Celebrations, One Love Story" : "Join Us For Our Celebration"}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.95, duration: 0.9, ease: "easeOut" }}
                    className="mt-8"
                >
                    <Link
                        href="/rsvp"
                        className="inline-block px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                        style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: "0.2em" }}
                    >
                        {lang === "es" ? "Ver invitación" : "View Invitation"}
                    </Link>
                </motion.div>
            </motion.div>

            {/* Countdown — compact card tucked into the bottom-right corner on larger screens; mobile uses the top bar above instead */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="hidden sm:block absolute bottom-8 right-8 z-10"
            >
                {attendingBoth ? (
                    <div className="flex flex-col gap-3">
                        <div
                            className="rounded-2xl px-5 py-4 backdrop-blur-md"
                            style={{ backgroundColor: "rgba(18,59,84,0.55)", border: "1px solid rgba(255,247,236,0.15)" }}
                        >
                            <CountdownTimer
                                targetDate={WEDDING_DATES.colombia}
                                label={`Colombia — ${formatLocalizedDate(new Date(WEDDING_DATES.colombia), lang)}`}
                                textColor={IVORY}
                                accentColor={SKY}
                                size="sm"
                            />
                        </div>
                        <div
                            className="rounded-2xl px-5 py-4 backdrop-blur-md"
                            style={{ backgroundColor: "rgba(18,59,84,0.55)", border: "1px solid rgba(255,247,236,0.15)" }}
                        >
                            <CountdownTimer
                                targetDate={WEDDING_DATES.usa}
                                label={`Florida — ${formatLocalizedDate(new Date(WEDDING_DATES.usa), lang)}`}
                                textColor={IVORY}
                                accentColor={APRICOT}
                                size="sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div
                        className="rounded-2xl px-6 py-5 backdrop-blur-md"
                        style={{ backgroundColor: "rgba(18,59,84,0.55)", border: "1px solid rgba(255,247,236,0.15)" }}
                    >
                        <CountdownTimer
                            targetDate={heroCountdown.date}
                            label={heroCountdown.label}
                            textColor={IVORY}
                            accentColor={APRICOT}
                            size="md"
                        />
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            >
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                    <ArrowDown size={16} style={{ color: APRICOT }} />
                </motion.div>
            </motion.div>
        </div>
    );
}
// Put this above OurStorySection (real pixel size of each file)
const STORY_PHOTOS = [
  { src: "/forehead.jpeg",   alt: "Happy together", width: 1600, height: 1067 },
  { src: "/ringsholder.jpeg", alt: "The ring",       width: 1200, height: 1600 },
];
function OurStorySection() {
    const { lang } = useLanguage();
    return (
        <section id="story" className="py-28 px-6" style={{ backgroundColor: IVORY }}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="uppercase tracking-widest mb-4" style={{ color: APRICOT, fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                        {lang === "es" ? "Nuestro camino" : "Our Journey"}
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: SKY_DEEP, lineHeight: 1.1 }}>
                        {lang === "es" ? "Nuestra historia hasta hoy" : "The Story So Far"}
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
                                src="/overthesholder.JPG"
                                alt={lang === "es" ? "La propuesta de matrimonio" : "The proposal"}
                                fill
                                className="object-cover"
                                style={{ objectPosition: "center 30%" }}
                            />
                        </div>
                        <div className="absolute -bottom-4 -right-4 rounded-xl px-6 py-4" style={{ backgroundColor: APRICOT, color: SKY_DEEP }}>
                            <p className="uppercase tracking-widest" style={{ fontSize: "0.55rem", letterSpacing: "0.2em" }}>{lang === "es" ? "La propuesta" : "The Proposal"}</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400 }}>{lang === "es" ? "Primavera de 2026" : "Spring 2026"}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="flex flex-col gap-6"
                    >
                        <p
                            className="uppercase tracking-widest"
                            style={{
                                color: APRICOT,
                                fontSize: "0.6rem",
                                letterSpacing: "0.25em",
                            }}
                        >
                            {lang === "es" ? "Cómo comenzó todo" : "How It All Began"}
                        </p>

                        <h3
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "2.25rem",
                                fontWeight: 300,
                                color: SKY_DEEP,
                                lineHeight: 1.15,
                            }}
                        >
                            {lang === "es" ? "Un desliz cambió todo" : "One Swipe Changed Everything"}
                        </h3>

                        <p
                            className="leading-relaxed"
                            style={{ color: SKY_DEEP, opacity: 0.75, fontSize: "0.95rem" }}
                        >
                            {lang === "es"
                                ? <>Lo que comenzó con un simple match en Hinge pronto se convirtió en algo que ninguno esperaba. Después de días conversando, tuvimos nuestra primera cita con papas cargadas en Flippin&apos; Fries Factory. Damariel estaba tan nervioso que casi no comió, pero todo cambió cuando descubrieron que a ambos les encantaban las películas de <em>Rápidos y Furiosos</em>.</>
                                : <>What started as a simple match on Hinge quickly became something neither of us expected. After days of talking and countless conversations, we met for our first date over loaded fries at Flippin&apos; Fries Factory. Damariel was so nervous he barely ate—but everything changed when they discovered they both loved the <em>Fast &amp; Furious</em> movies.</>}
                        </p>

                        <p
                            className="leading-relaxed"
                            style={{ color: SKY_DEEP, opacity: 0.75, fontSize: "0.95rem" }}
                        >
                            {lang === "es"
                                ? "Ese almuerzo se convirtió en un día entero juntos y, pronto, nos volvimos el mayor apoyo del otro. Entre la universidad, los cambios de carrera, los sueños de estudiar medicina y una mudanza a Texas, nuestra relación se fortaleció con cada nueva aventura."
                                : "That lunch date turned into an entire day together, and before long we became each other's biggest supporters. Through college, career changes, medical school dreams, and a move to Texas, our relationship continued to grow stronger with every new adventure."}
                        </p>

                        <p
                            className="leading-relaxed"
                            style={{ color: SKY_DEEP, opacity: 0.75, fontSize: "0.95rem" }}
                        >
                            {lang === "es"
                                ? <>Después de meses de preparación, Damariel sorprendió a Jhoana con una cita en el Dallas Arboretum and Botanical Garden. Rodeado de hermosos jardines y con un fotógrafo capturando el momento, se arrodilló y le pidió compartir la vida juntos. Ella dijo <strong>que sí</strong>.</>
                                : <>After months of planning, Damariel surprised Jhoana with a date at the Dallas Arboretum and Botanical Garden. Surrounded by beautiful gardens and hidden behind the lens of a photographer, he got down on one knee and asked her to spend forever with him. She said <strong>yes</strong>.</>}
                        </p>

                        <div className="h-px" style={{ backgroundColor: SAND }} />

                        <div className="flex gap-8">
                            {[
                                ["1", lang === "es" ? "Primera cita" : "First Date"],
                                ["2", lang === "es" ? "Celebraciones" : "Celebrations"],
                                ["∞", lang === "es" ? "Para siempre" : "Forever"],
                            ].map(([num, label]) => (
                                <div key={label}>
                                    <p
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: "2rem",
                                            color: APRICOT,
                                            fontWeight: 300,
                                        }}
                                    >
                                        {num}
                                    </p>
                                    <p
                                        className="uppercase tracking-widest"
                                        style={{
                                            fontSize: "0.55rem",
                                            color: SKY_DEEP,
                                            opacity: 0.6,
                                            letterSpacing: "0.15em",
                                        }}
                                    >
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="flex justify-center mt-14"
                >
                    <Link
                        href="/our-story"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                        style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: "0.2em" }}
                    >
                        {lang === "es" ? "Lee nuestra historia completa" : "Read Our Full Story"}
                        <span aria-hidden="true">→</span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Wedding destination card ───────────────────────────────────────────────
function WeddingCard({
                         title, date, location, image, accentColor, bgGradient, linkTo, delay = 0,
                     }: {
    title: string; date: string; location: string; image: string;
    accentColor: string; bgGradient: string; linkTo: string; delay?: number;
}) {
    const { lang } = useLanguage();
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
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: IVORY, lineHeight: 1.1 }}>
                    {title}
                </h3>
                <div className="flex items-center gap-2 mt-3">
                    <MapPin size={12} style={{ color: accentColor }} />
                    <p className="text-xs" style={{ color: "rgba(255,247,236,0.7)" }}>{location}</p>
                </div>
                <Link
                    href={linkTo}
                    className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: IVORY, letterSpacing: "0.15em" }}
                >
                    {lang === "es" ? "Explorar" : "Explore"}
                    <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Inline countdown card (paired with each WeddingCard below the grid) ───
function WeddingCountdownCard({
                                  label, place, date, targetDate, accentColor, accentColorDark, bgTint, borderTint, delay = 0,
                              }: {
    label: string; place: string; date: string; targetDate: Date | string;
    accentColor: string; accentColorDark: string; bgTint: string; borderTint: string; delay?: number;
}) {
    const { lang } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay }}
            className="flex flex-col items-center text-center p-8 rounded-2xl"
            style={{ backgroundColor: bgTint, border: `1px solid ${borderTint}` }}
        >
            <p className="uppercase tracking-widest mb-2" style={{ color: accentColorDark, fontSize: "0.55rem", letterSpacing: "0.25em" }}>
                {label}
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, color: accentColorDark }}>
                {place}
            </h3>
            <div className="flex items-center gap-2 mt-2 mb-6">
                <Calendar size={12} style={{ color: accentColor }} />
                <p className="text-xs" style={{ color: SKY_DEEP, opacity: 0.7 }}>{date}</p>
            </div>
            <CountdownTimer
                targetDate={targetDate}
                label={lang === "es" ? "Cuenta regresiva" : undefined}
                textColor={accentColorDark}
                accentColor={accentColor}
                size="md"
            />
        </motion.div>
    );
}

// ─── "Not attending either" fallback card ──────────────────────────────────
function NoAttendanceNotice() {
    const { lang } = useLanguage();
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto text-center rounded-2xl px-8 py-12"
            style={{ backgroundColor: IVORY, border: `1px solid ${SAND}` }}
        >
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.85rem", fontWeight: 400, color: SKY_DEEP }}>
                {lang === "es" ? "Te extrañaremos" : "We&apos;ll miss you there"}
            </h3>
            <p className="mt-4 leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: "0.9rem" }}>
                {lang === "es"
                    ? "Entendemos que no puedas acompañarnos en Colombia ni en Florida, y agradecemos muchísimo que sigas siendo parte de nuestra historia. Si quieres celebrar con nosotros a la distancia, puedes visitar nuestra lista de regalos."
                    : "It looks like you&apos;re not able to join us in Colombia or Florida right now — we understand, and we&apos;re so grateful you&apos;re still part of our story. If you&apos;d like to celebrate with us from afar, you&apos;re welcome to visit our registry."}
            </p>
            <p className="mt-3 leading-relaxed" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: "0.9rem" }}>
                {lang === "es" ? "Si tus planes cambian, avísanos y actualizaremos tu confirmación." : "And if anything changes, just let us know — we can always update your RSVP."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    href="/registry"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                    style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: "0.2em" }}
                >
                    <Gift size={14} />
                    {lang === "es" ? "Ver lista de regalos" : "View Registry"}
                </Link>
                <Link
                    href="/rsvp"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-70"
                    style={{ border: `1px solid ${APRICOT}`, color: SKY_DEEP, letterSpacing: "0.2em" }}
                >
                    <Mail size={14} />
                    {lang === "es" ? "Actualizar confirmación" : "Update RSVP"}
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Weddings + Countdown (merged) ─────────────────────────────────────────
// Combines what used to be two separate sections (destination cards, then a
// countdown strip below) into one section: destination cards up top, matching
// countdowns for the same weddings directly beneath — one heading, one flow.
function WeddingsSection({
                             attendingColombia,
                             attendingFlorida,
                             attendingBoth,
                             attendingNeither,
                         }: {
    attendingColombia: boolean;
    attendingFlorida: boolean;
    attendingBoth: boolean;
    attendingNeither: boolean;
}) {
    const { lang } = useLanguage();
    return (
        <section className="py-24 px-6" style={{ backgroundColor: SAND }}>
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <p className="uppercase tracking-widest mb-4" style={{ color: APRICOT, fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                        {lang === "es"
                            ? attendingBoth ? "Dos celebraciones" : "Nuestra celebración"
                            : attendingBoth ? "Two Celebrations" : "Our Celebration"}
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 300, color: SKY_DEEP, lineHeight: 1.1 }}>
                        {lang === "es"
                            ? attendingNeither ? "Celebramos contigo desde cualquier lugar" : "Estás invitado"
                            : attendingNeither ? "Celebrating With You, From Anywhere" : "You're Invited"}
                    </h2>
                    {!attendingNeither && (
                        <p className="mt-4 max-w-md mx-auto" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: "0.9rem" }}>
                            {attendingBoth
                                ? lang === "es"
                                    ? "Dos bodas, dos países y una historia de amor inolvidable. ¡No vemos la hora de celebrar contigo! Aquí encontrarás los detalles."
                                    : "Two weddings, two countries, one unforgettable love story. We can't wait to celebrate with you. Here are the details for our big day."
                                : lang === "es"
                                    ? "No vemos la hora de celebrar contigo. Aquí encontrarás los detalles de nuestro gran día."
                                    : "We can't wait to celebrate with you. Here are the details for our big day."}
                        </p>
                    )}
                </motion.div>

                {attendingNeither ? (
                    <NoAttendanceNotice />
                ) : (
                    <>
                        {/* Destination cards */}
                        <div
                            className={`grid grid-cols-1 gap-6 mx-auto mb-16 ${
                                attendingColombia && attendingFlorida ? "md:grid-cols-2 max-w-3xl" : "max-w-md"
                            }`}
                        >
                            {attendingColombia && (
                                <WeddingCard
                                    title={lang === "es" ? "Boda en Colombia" : "Colombia Wedding"}
                                    date={formatLocalizedDate(new Date(WEDDING_DATES.colombia), lang)}
                                    location="Manizales, Colombia"
                                    image="/lin.jpeg"
                                    accentColor={SKY}
                                    bgGradient="linear-gradient(to top, rgba(18,59,84,0.75) 0%, rgba(18,59,84,0.2) 50%, rgba(18,59,84,0) 100%)"
                                    linkTo="/colombia"
                                    delay={0.1}
                                />
                            )}
                            {attendingFlorida && (
                                <WeddingCard
                                    title={lang === "es" ? "Boda en Florida" : "Florida Wedding"}
                                    date={formatLocalizedDate(new Date(WEDDING_DATES.usa), lang)}
                                    location="Gainesville, Florida"
                                    image="/baughman-center.jpg"
                                    accentColor={GREENERY}
                                    bgGradient="linear-gradient(to top, rgba(18,59,84,0.78) 0%, rgba(18,59,84,0.18) 55%, rgba(18,59,84,0) 100%)"
                                    linkTo="/florida"
                                    delay={0.25}
                                />
                            )}
                        </div>

                        {/* Matching countdowns, same section, no repeated heading */}
                        <div
                            className={`grid grid-cols-1 gap-8 ${
                                attendingColombia && attendingFlorida ? "md:grid-cols-2" : "max-w-sm mx-auto"
                            }`}
                        >
                            {attendingColombia && (
                                <WeddingCountdownCard
                                    label={lang === "es" ? "Boda en Colombia" : "Colombia"}
                                    place="Pereira, Colombia"
                                    date={formatLocalizedDate(new Date(WEDDING_DATES.colombia), lang)}
                                    targetDate={WEDDING_DATES.colombia}
                                    accentColor={SKY}
                                    accentColorDark={SKY_MID}
                                    bgTint={`${SKY}18`}
                                    borderTint={`${SKY}55`}
                                    delay={0.1}
                                />
                            )}
                            {attendingFlorida && (
                                <WeddingCountdownCard
                                    label={lang === "es" ? "Boda en Florida" : "Florida"}
                                    place="Gainesville, Florida"
                                    date={formatLocalizedDate(new Date(WEDDING_DATES.usa), lang)}
                                    targetDate={WEDDING_DATES.usa}
                                    accentColor={GREENERY}
                                    accentColorDark={GREENERY_DARK}
                                    bgTint={`${GREENERY}18`}
                                    borderTint={`${GREENERY}55`}
                                    delay={0.25}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

// ─── RSVP banner ─────────────────────────────────────────────────────────────
// Was solid navy — same as the Footer right below it — so the two blended
// into one long dark block with no visual break. Switched to a warm
// apricot-to-sand gradient so it reads as its own section and the navy
// Footer underneath stays a clear, deliberate ending.
function RSVPBannerSection({
                               attendingColombia,
                               attendingFlorida,
                               attendingBoth,
                               attendingNeither,
                               firstName,
                               plusOneCount,
                               email,
                               phone,
                           }: {
    attendingColombia: boolean;
    attendingFlorida: boolean;
    attendingBoth: boolean;
    attendingNeither: boolean;
    firstName?: string | null;
    plusOneCount?: number | null;
    email?: string | null;
    phone?: string | null;
}) {
    const { lang } = useLanguage();
    const totalGuests = (plusOneCount ?? 0) + 1;
    const contactAddress = email || phone || null;

    const locationCopy = attendingBoth
        ? "Colombia and Florida"
        : attendingColombia
            ? "Colombia"
            : attendingFlorida
                ? "Gainesville, Florida"
                : null;

    return (
        <section
            className="py-24 px-6 relative overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${APRICOT} 0%, ${SAND} 100%)` }}
        >
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        `radial-gradient(circle at 30% 50%, ${IVORY} 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${SKY} 0%, transparent 50%)`,
                }}
            />
            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    {attendingNeither ? (
                        <>
                            <p className="uppercase tracking-widest mb-4" style={{ color: SKY_DEEP, fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                                {lang === "es" ? "Sentimos que no puedas venir" : "So Sorry To Miss You"}
                            </p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: SKY_DEEP, lineHeight: 1.05 }}>
                                {firstName ? (
                                    <>{lang === "es" ? "Te extrañaremos," : "We&apos;ll miss you,"} <span style={{ fontStyle: "italic" }} translate="no">{firstName}</span></>
                                ) : (
                                    lang === "es" ? "Te extrañaremos" : "We'll Miss You"
                                )}
                            </h2>
                            <p className="mt-6" style={{ color: SKY_DEEP, opacity: 0.8, fontSize: "0.95rem" }}>
                                {lang === "es"
                                    ? "Parece que no podrás acompañarnos en Colombia ni en Florida. No te preocupes, nos alegra que seas parte de nuestra historia."
                                    : "It looks like you won&apos;t be able to join us in Colombia or Florida — no worries at all, we&apos;re just happy you&apos;re part of our story."}
                            </p>
                            <p className="mt-4" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: "0.9rem" }}>
                                {lang === "es"
                                    ? "Puedes celebrar con nosotros desde lejos con un regalo de nuestra lista. Si tus planes cambian, nos encantará recibirte; solo actualiza tu confirmación."
                                    : "You're welcome to celebrate from afar with a gift from our registry, and if plans change, we'd love to have you — just send us an updated RSVP any time."}
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/registry"
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                                    style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: "0.2em" }}
                                >
                                    <Gift size={14} />
                                    {lang === "es" ? "Ver lista de regalos" : "View Registry"}
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-70"
                                    style={{ border: `1px solid ${SKY_DEEP}`, color: SKY_DEEP, letterSpacing: "0.2em" }}
                                >
                                    {lang === "es" ? "Actualizar mi confirmación" : "Update My RSVP"}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="uppercase tracking-widest mb-4" style={{ color: SKY_DEEP, fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                                {lang === "es" ? "Tu asistencia está confirmada" : "You&apos;re Confirmed"}
                            </p>
                            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 300, color: SKY_DEEP, lineHeight: 1.05 }}>
                                {firstName ? (
                                    <>{lang === "es" ? "Gracias," : "Thank you,"} <span style={{ fontStyle: "italic" }} translate="no">{firstName}</span></>
                                ) : (
                                    lang === "es" ? "Gracias" : "Thank You"
                                )}
                            </h2>

                            <p className="mt-6" style={{ color: SKY_DEEP, opacity: 0.8, fontSize: "0.95rem" }}>
                                {lang === "es" ? `Guardamos tu lugar para ${locationCopy === "Colombia and Florida" ? "Colombia y Florida" : locationCopy}` : `We&apos;ve saved your spot for ${locationCopy}`}
                                {totalGuests > 1 ? lang === "es" ? ` para ${totalGuests} personas` : ` for ${totalGuests} guests` : "."}
                            </p>

                            <p className="mt-4 mb-2" style={{ color: SKY_DEEP, opacity: 0.7, fontSize: "0.9rem" }}>
                                {lang === "es"
                                    ? `Te enviaremos la invitación oficial para confirmar tu asistencia${contactAddress ? " a:" : " más adelante."}`
                                    : `Your official RSVP invitation will be sent later${contactAddress ? " to:" : "."}`}
                            </p>

                            {contactAddress && (
                                <p
                                    className="mb-10 inline-block px-5 py-2 rounded-full"
                                    style={{
                                        backgroundColor: "rgba(18,59,84,0.08)",
                                        border: `1px solid ${SKY_DEEP}33`,
                                        color: SKY_DEEP,
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {contactAddress}
                                </p>
                            )}

                            <div className={contactAddress ? "" : "mt-4"}>
                                <Link
                                    href="/rsvp"
                                    className="inline-block px-10 py-4 rounded-full text-xs tracking-widest uppercase transition-all hover:opacity-90"
                                    style={{ backgroundColor: SKY_DEEP, color: IVORY, letterSpacing: "0.2em" }}
                                >
                                    {lang === "es" ? "Ver mis datos" : "View My Details"}
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
    const { guest, loaded } = useGuest();
    const { attendingColombia, attendingFlorida, attendingBoth, attendingNeither } = useAttendance(guest);

    // Avoid a flash of the wrong layout before sessionStorage is read on mount.
    if (!loaded) return null;

    return (
        <>
            <WelcomeBanner name={guest?.firstName ?? null} />
            <HeroSection
                attendingColombia={attendingColombia}
                attendingFlorida={attendingFlorida}
                attendingBoth={attendingBoth}
            />
            <OurStorySection />
            <WeddingsSection
                attendingColombia={attendingColombia}
                attendingFlorida={attendingFlorida}
                attendingBoth={attendingBoth}
                attendingNeither={attendingNeither}
            />
            <RSVPBannerSection
                attendingColombia={attendingColombia}
                attendingFlorida={attendingFlorida}
                attendingBoth={attendingBoth}
                attendingNeither={attendingNeither}
                firstName={guest?.firstName ?? null}
                plusOneCount={guest?.plusOneCount ?? null}
                email={guest?.email ?? null}
                phone={guest?.phone ?? null}
            />
        </>
    );
}