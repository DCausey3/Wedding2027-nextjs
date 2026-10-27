"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart, Loader2, CheckCircle, Calendar, Sparkles, Bell, Gift, Mail, Phone as PhoneIcon, Home, MapPin,
    Users, Baby, Plus, X,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatLocalizedDate } from "@/lib/utils";

// Palette — Sky Blue + Apricot + Ivory + Sand
const NAVY = "#123B54"; // SKY_DEEP
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const GREENERY = "#7FAA6E";
const MUTED = "#8a9aa5";
const WARN = "#d98080";

// Keep in sync with MAX_CHILDREN in /api/std-rsvp
const MAX_CHILDREN = 8;

type Guest = {
    id: string;
    firstName: string;
    lastName: string;
    selectedWedding: "Colombia" | "USA" | "Both" | null;
    plusOneCount: number | null;
    plusOneAllowed: boolean | null;
    role?: string | null;
    invitationType?: string | null;
    phone?: string | null;
    email?: string | null;
    mailingAddress?: string | null;
};

type PartyMember = {
    key: string;
    fullName: string;
    memberType: "adult" | "child";
    age: string; // kept as a string for the input; converted on submit
    attendingColombia: boolean;
    attendingFlorida: boolean;
    touched: boolean; // true once the guest has toggled this person's weddings themselves
};

type PartyInfo = {
    allowance: number; // extra adults this invitation allows
    childrenAllowed: boolean;
    selectedWedding: string | null;
    stdResponded: boolean;
};

const makeKey = () => Math.random().toString(36).slice(2, 10);

const blankMember = (memberType: "adult" | "child"): PartyMember => ({
    key: makeKey(),
    fullName: "",
    memberType,
    age: "",
    attendingColombia: false,
    attendingFlorida: false,
    touched: false,
});

function isBridalParty(guest: Guest) {
    return guest.role === "bridal_party" || guest.invitationType === "bridal_party";
}

function fireConfetti() {
    import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        const colors = [APRICOT, SKY, "#fff", GREENERY, SAND];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors });
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 60 }), 300);
        setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors, angle: 120 }), 400);
    }).catch(() => {});
}

const WEDDING_INFO: Record<string, { date: Date; place: string; color: string; micro?: boolean }> = {
    Colombia: { date: new Date(2027, 5, 12), place: "Manizales, Colombia", color: SKY },
    USA: { date: new Date(2027, 3, 24), place: "Gainesville, Florida", color: APRICOT, micro: true },
};

type AttendChoice = "both" | "colombia" | "usa" | "decline" | null;

function getChoiceMode(guest: Guest): "single-colombia" | "single-usa" | "both-choice" {
    if (guest.selectedWedding === "Colombia") return "single-colombia";
    if (guest.selectedWedding === "USA") return "single-usa";
    return "both-choice";
}

type SaveCopy = {
    missingGuest: string;
    missingSession: string;
    submissionFailed: string;
    thankYou: string;
    missYou: string;
    redirecting: string;
    saveDate: string;
    bridalBadge: string;
    welcome: string;
    bridalIntro: string;
    bothIntro: string;
    singleIntro: string;
    intimateNotice: string;
    familyNotice: string;
    colombiaOnly: string;
    floridaOnly: string;
    accept: string;
    acceptNote: string;
    declineChoice: string;
    bothChoice: string;
    bothChoiceNote: string;
    decline: string;
    declineNote: string;
    fixedGuestCount: string;
    partyTitle: string;
    partyIntroOne: string;
    partyIntroMany: string;
    partyIntroNone: string;
    kidsNote: string;
    you: string;
    guestLabel: string;
    childLabel: string;
    fullName: string;
    childName: string;
    childAge: string;
    remove: string;
    addGuest: string;
    addChild: string;
    spotsLeft: string;
    attendingLabel: string;
    colombiaShort: string;
    floridaShort: string;
    partyTotal: string;
    person: string;
    people: string;
    namesRequired: string;
    updates: string;
    updatesNote: string;
    email: string;
    phone: string;
    mailingAddress: string;
    mailingNote: string;
    mailingPlaceholder: string;
    passportQuestion: string;
    passportYes: string;
    passportNo: string;
    passportHelp: string;
    passportApply: string;
    smsTitle: string;
    smsOptional: string;
    smsDisclosure: string;
    terms: string;
    privacy: string;
    reason: string;
    reasonNote: string;
    optionalNote: string;
    confirm: string;
    retryConfirmation: string;
    emailFailure: string;
    questions: string;
    submittedThanks: string;
    submittedMiss: string;
    emailSent: string;
    registryNudge: string;
    redirectHome: string;
    weddingLabels: { colombia: string; florida: string };
    backToLogin: string;
};

const COPY_EN: SaveCopy = {
    missingGuest: "Missing guest reference. Please log in again.",
    missingSession: "We couldn't find your session. Please log in again.",
    submissionFailed: "Submission failed",
    thankYou: "Thank you, we can't wait!",
    missYou: "We'll miss you",
    redirecting: "Taking you to the homepage…",
    saveDate: "Save the Date",
    bridalBadge: "✦ Bridal Party · You're Part of Our Inner Circle ✦",
    welcome: "Welcome",
    bridalIntro: "We are so glad to have you as part of the bridal party. We're having two celebrations and would love to have you at both — but we know travel and life happen, so let us know what works for you.",
    bothIntro: "Jhoana and Damariel are so excited to celebrate with you. We're having two celebrations — please let us know which you'll be able to join.",
    singleIntro: "Jhoana and Damariel are so excited to celebrate with you. Please confirm whether you'll be able to join us.",
    intimateNotice: "Our Gainesville celebration will be a small, micro-intimate gathering — due to space, we unfortunately aren't able to expand this guest list. If a headcount is shown below, it already includes you.",
    familyNotice: "This will be an intimate celebration with family and close friends only. If there's someone in your party who isn't reflected here, we sincerely apologize and hope you understand.",
    colombiaOnly: "Colombia Only",
    floridaOnly: "Gainesville Only",
    accept: "Joyfully Accepts",
    acceptNote: "We'll be there to celebrate!",
    declineChoice: "Declines with Regret",
    bothChoice: "We'll Attend Both",
    bothChoiceNote: "Colombia and Gainesville — our favorite answer!",
    decline: "Can't Attend Either",
    declineNote: "We'll miss you, but understand.",
    fixedGuestCount: "Gainesville's guest list is fixed, so please keep this accurate.",
    partyTitle: "Your party",
    partyIntroOne: "We've saved 1 spot for a guest of yours. Add their name, or remove it if you won't be bringing anyone.",
    partyIntroMany: "We've saved {count} spots for your guests. Add their names, or remove any you won't be using.",
    partyIntroNone: "Bringing little ones? Let us know how many.",
    kidsNote: "Children are welcome — just let us know how many are coming.",
    you: "You",
    guestLabel: "Guest {n}",
    childLabel: "Child {n}",
    fullName: "Full name",
    childName: "Name (optional)",
    childAge: "Age",
    remove: "Remove",
    addGuest: "Add a guest",
    addChild: "Add a child",
    spotsLeft: "Left: {count}",
    attendingLabel: "Attending",
    colombiaShort: "Colombia",
    floridaShort: "Gainesville",
    partyTotal: "In your party",
    person: "person",
    people: "people",
    namesRequired: "Please add a name for each guest, or remove the spot.",
    updates: "Stay in the loop",
    updatesNote: "We'll keep you updated as the wedding gets closer.",
    email: "Email",
    phone: "Phone",
    mailingAddress: "Mailing Address",
    mailingNote: "We'll use this to send your formal RSVP invitation and, later, a thank-you card.",
    mailingPlaceholder: "Street address, city, state, ZIP",
    passportQuestion: "Do you have a passport or need to get one for your trip to Colombia?",
    passportYes: "Yes",
    passportNo: "No",
    passportHelp: "If you need to apply for a passport, visit the U.S. Department of State:",
    passportApply: "Apply for a passport",
    smsTitle: "Text Message Updates",
    smsOptional: "Optional reminders by text",
    smsDisclosure: "By enabling, you agree to receive text messages from Causey/Cardenas Wedding, including save-the-date announcements, RSVP reminders, and travel updates. Message frequency varies (approx. 2–5 messages). Msg & data rates may apply. Reply STOP to cancel, HELP for help. See our",
    terms: "Terms",
    privacy: "Privacy Policy",
    reason: "Help us understand (optional)",
    reasonNote: "If there's a reason you're unable to join — travel, health, or otherwise — feel free to share.",
    optionalNote: "Optional note…",
    confirm: "Confirm",
    retryConfirmation: "Retry confirmation email",
    emailFailure: "We saved your response, but couldn't send the confirmation email. Please try again or contact us:",
    questions: "Questions? Reach out to us anytime — we're happy to help.",
    submittedThanks: "We've sent a confirmation to",
    emailSent: "with everything you need to stay in the loop.",
    submittedMiss: "You're always welcome to return to this site if you'd like to send a gift from our registry.",
    registryNudge: "You're always welcome to return to this site if you'd like to send a gift from our registry.",
    redirectHome: "Taking you to the homepage…",
    weddingLabels: { colombia: "Colombia Wedding", florida: "Gainesville Wedding" },
    backToLogin: "Back to Login",
};

const COPY_ES: typeof COPY_EN = {
    missingGuest: "No encontramos la referencia de tu invitación. Inicia sesión de nuevo.",
    missingSession: "No encontramos tu sesión. Inicia sesión de nuevo.",
    submissionFailed: "No se pudo enviar la respuesta",
    thankYou: "¡Gracias! Nos alegra mucho.",
    missYou: "Te extrañaremos",
    redirecting: "Te llevaremos a la página de inicio…",
    saveDate: "Reserva la fecha",
    bridalBadge: "✦ Cortejo nupcial · Eres parte de nuestro círculo íntimo ✦",
    welcome: "Te damos la bienvenida",
    bridalIntro: "Nos alegra mucho que formes parte del cortejo nupcial. Tendremos dos celebraciones y nos encantaría que pudieras asistir a ambas, pero sabemos que viajar y la vida pueden complicarlo. Cuéntanos qué te funciona.",
    bothIntro: "Jhoana y Damariel están muy felices de celebrar contigo. Tendremos dos celebraciones; cuéntanos a cuál podrás asistir.",
    singleIntro: "Jhoana y Damariel están muy felices de celebrar contigo. Confírmanos si podrás acompañarnos.",
    intimateNotice: "Nuestra celebración en Gainesville será muy íntima y pequeña. Debido al espacio, no podemos ampliar la lista de invitados. Si aparece un número de invitados abajo, ya te incluye.",
    familyNotice: "Será una celebración íntima solo con familiares y amistades cercanas. Si alguien de tu grupo no aparece aquí, lo sentimos mucho y esperamos que lo entiendas.",
    colombiaOnly: "Solo a Colombia",
    floridaOnly: "Solo a Gainesville",
    accept: "Acepto con alegría",
    acceptNote: "¡Estaremos allí para celebrar!",
    declineChoice: "Declino con pesar",
    bothChoice: "Asistiremos a ambas",
    bothChoiceNote: "Colombia y Gainesville: ¡nuestra respuesta favorita!",
    decline: "No puedo asistir a ninguna",
    declineNote: "Te extrañaremos, pero lo entendemos.",
    fixedGuestCount: "La lista de invitados de Gainesville es fija; por favor, indica los datos correctos.",
    partyTitle: "Tu grupo",
    partyIntroOne: "Reservamos 1 lugar para un acompañante tuyo. Agrega su nombre o elimínalo si no vendrá nadie contigo.",
    partyIntroMany: "Reservamos {count} lugares para tus acompañantes. Agrega sus nombres o elimina los que no vayas a usar.",
    partyIntroNone: "¿Vienes con niños? Cuéntanos cuántos.",
    kidsNote: "Los niños son bienvenidos; solo cuéntanos cuántos vienen.",
    you: "Tú",
    guestLabel: "Invitado {n}",
    childLabel: "Niño/a {n}",
    fullName: "Nombre completo",
    childName: "Nombre (opcional)",
    childAge: "Edad",
    remove: "Eliminar",
    addGuest: "Agregar un invitado",
    addChild: "Agregar un niño o niña",
    spotsLeft: "Quedan: {count}",
    attendingLabel: "Asistirá a",
    colombiaShort: "Colombia",
    floridaShort: "Gainesville",
    partyTotal: "En tu grupo",
    person: "persona",
    people: "personas",
    namesRequired: "Agrega el nombre de cada invitado o elimina el lugar.",
    updates: "Mantente al tanto",
    updatesNote: "Te enviaremos novedades a medida que se acerque la boda.",
    email: "Correo electrónico",
    phone: "Teléfono",
    mailingAddress: "Dirección postal",
    mailingNote: "Usaremos esta dirección para enviarte la invitación formal y, más adelante, una tarjeta de agradecimiento.",
    mailingPlaceholder: "Calle, ciudad, estado o provincia, código postal",
    passportQuestion: "¿Tienes pasaporte o necesitas tramitar uno para tu viaje a Colombia?",
    passportYes: "Sí",
    passportNo: "No",
    passportHelp: "Si necesitas tramitar un pasaporte, visita el Departamento de Estado de EE. UU.:",
    passportApply: "Solicitar un pasaporte",
    smsTitle: "Novedades por mensaje de texto",
    smsOptional: "Recordatorios opcionales por mensaje",
    smsDisclosure: "Al activar esta opción, aceptas recibir mensajes de texto de la boda de Causey/Cárdenas, incluidos avisos para reservar la fecha, recordatorios de confirmación y novedades de viaje. La frecuencia varía (aprox. 2–5 mensajes). Pueden aplicarse cargos por mensajes y datos. Responde STOP para cancelar o HELP para obtener ayuda. Consulta nuestros",
    terms: "Términos",
    privacy: "Política de privacidad",
    reason: "Ayúdanos a entender (opcional)",
    reasonNote: "Si hay algún motivo por el que no puedas acompañarnos —viaje, salud u otro—, puedes contárnoslo.",
    optionalNote: "Nota opcional…",
    confirm: "Confirmar",
    retryConfirmation: "Reintentar el correo de confirmación",
    emailFailure: "Guardamos tu respuesta, pero no pudimos enviar el correo de confirmación. Inténtalo de nuevo o contáctanos:",
    questions: "¿Tienes preguntas? Escríbenos cuando quieras; con gusto te ayudaremos.",
    submittedThanks: "Enviamos una confirmación a",
    emailSent: "con toda la información para mantenerte al tanto.",
    submittedMiss: "Si quieres enviarnos un regalo, puedes volver a este sitio cuando quieras.",
    registryNudge: "Si quieres enviarnos un regalo, puedes volver a este sitio cuando quieras.",
    redirectHome: "Te llevaremos a la página de inicio…",
    weddingLabels: { colombia: "Boda en Colombia", florida: "Boda en Gainesville" },
    backToLogin: "Volver al inicio de sesión",
};

// ─── Party roster pieces ────────────────────────────────────────────────────
function WeddingChip({ label, on, color, onClick, readOnly = false }: {
    label: string; on: boolean; color: string; onClick?: () => void; readOnly?: boolean;
}) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={on}
            disabled={readOnly}
            onClick={onClick}
            className="px-3 py-1.5 rounded-full text-[0.62rem] uppercase tracking-[0.1em] transition-all disabled:cursor-default"
            style={{
                backgroundColor: on ? color : "#fff",
                color: NAVY,
                border: `1.5px solid ${on ? color : `${NAVY}20`}`,
                opacity: readOnly && !on ? 0.5 : 1,
            }}
        >
            {on ? "✓ " : ""}{label}
        </button>
    );
}

function PartyRow({
    title, member, eligibleColombia, eligibleFlorida, t, nameMissing, onChange, onRemove,
}: {
    title: string;
    member: PartyMember;
    eligibleColombia: boolean;
    eligibleFlorida: boolean;
    t: SaveCopy;
    nameMissing: boolean;
    onChange: (patch: Partial<PartyMember>) => void;
    onRemove: () => void;
}) {
    const isChild = member.memberType === "child";
    const inputStyle = { backgroundColor: "#fff", border: "1.5px solid transparent", color: NAVY } as const;

    return (
        <div
            className="rounded-xl p-4"
            style={{ backgroundColor: SAND_LIGHT, border: `1.5px solid ${nameMissing ? WARN : SAND}` }}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-[0.6rem] uppercase tracking-[0.16em] flex items-center gap-1.5" style={{ color: `${NAVY}80` }}>
                    {isChild ? <Baby size={12} style={{ color: APRICOT }} /> : <Users size={12} style={{ color: APRICOT }} />}
                    {title}
                </p>
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`${t.remove}: ${title}`}
                    className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] hover:opacity-70"
                    style={{ color: `${NAVY}80` }}
                >
                    <X size={12} /> {t.remove}
                </button>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={member.fullName}
                    onChange={(e) => onChange({ fullName: e.target.value })}
                    placeholder={isChild ? t.childName : t.fullName}
                    aria-label={isChild ? t.childName : t.fullName}
                    maxLength={100}
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl text-sm outline-none"
                    style={inputStyle}
                />
                {isChild && (
                    <input
                        type="number"
                        min={0}
                        max={17}
                        value={member.age}
                        onChange={(e) => onChange({ age: e.target.value })}
                        placeholder={t.childAge}
                        aria-label={t.childAge}
                        className="w-20 px-3 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle}
                    />
                )}
            </div>

            <div className="mt-3">
                <p className="text-[0.55rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>{t.attendingLabel}</p>
                <div className="flex flex-wrap gap-2">
                    {eligibleColombia && (
                        <WeddingChip
                            label={t.colombiaShort}
                            color={SKY}
                            on={member.attendingColombia}
                            onClick={() => onChange({ attendingColombia: !member.attendingColombia, touched: true })}
                        />
                    )}
                    {eligibleFlorida && (
                        <WeddingChip
                            label={t.floridaShort}
                            color={APRICOT}
                            on={member.attendingFlorida}
                            onClick={() => onChange({ attendingFlorida: !member.attendingFlorida, touched: true })}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SaveTheDateContent() {
    const { lang } = useLanguage();
    const t = lang === "es" ? COPY_ES : COPY_EN;
    const router = useRouter();
    const searchParams = useSearchParams();
    const guestId = searchParams.get("guest");

    const [guest, setGuest] = useState<Guest | null>(null);
    const [loadError, setLoadError] = useState("");
    const [attendChoice, setAttendChoice] = useState<AttendChoice>(null);
    const [party, setParty] = useState<PartyMember[]>([]);
    const [partyInfo, setPartyInfo] = useState<PartyInfo | null>(null);
    const [partyLoading, setPartyLoading] = useState(true);
    const [showNameErrors, setShowNameErrors] = useState(false);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [mailingAddress, setMailingAddress] = useState("");
    const [passportAnswer, setPassportAnswer] = useState<boolean | null>(null);
    const [smsConsent, setSmsConsent] = useState(false);
    const [declineNote, setDeclineNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmationPending, setConfirmationPending] = useState(false);
    const [confirmationError, setConfirmationError] = useState(false);
    const [done, setDone] = useState(false);

    const confettiFired = useRef(false);
    const bridal = guest ? isBridalParty(guest) : false;
    const choiceMode = guest ? getChoiceMode(guest) : null;

    useEffect(() => {
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.id === guestId) {
                    setGuest(parsed);
                    setPhone(parsed.phone ?? "");
                    setEmail(parsed.email ?? "");
                    setMailingAddress(parsed.mailingAddress ?? "");
                    return;
                }
            } catch {
                // fall through to error state
            }
        }

        if (!guestId) {
            setLoadError(t.missingGuest);
            return;
        }

        setLoadError(t.missingSession);
    }, [guestId, t.missingGuest, t.missingSession]);

    // Load the invitation's allowance and any saved party from the database,
    // so returning guests see exactly what they entered (and what we reserved for them).
    useEffect(() => {
        if (!guest) return;
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`/api/guest-party?guest=${encodeURIComponent(guest.id)}`);
                if (!res.ok) throw new Error("party lookup failed");
                const j = await res.json();
                if (cancelled) return;

                const allowance = Number(j.plusOneCount) || 0;
                setPartyInfo({
                    allowance,
                    childrenAllowed: !!j.childrenAllowed,
                    selectedWedding: j.selectedWedding ?? null,
                    stdResponded: !!j.stdResponded,
                });

                if (j.stdResponded) {
                    // They've answered before: show what they saved (even if they removed everyone).
                    setParty(
                        (j.party ?? []).map((m: any): PartyMember => ({
                            key: makeKey(),
                            fullName: m.fullName ?? "",
                            memberType: m.memberType === "child" ? "child" : "adult",
                            age: m.age === null || m.age === undefined ? "" : String(m.age),
                            attendingColombia: !!m.attendingColombia,
                            attendingFlorida: !!m.attendingFlorida,
                            touched: true,
                        })),
                    );
                } else {
                    // First visit: pre-fill the spots we've reserved so they can name or remove them.
                    setParty(Array.from({ length: allowance }, () => blankMember("adult")));
                }
            } catch {
                if (cancelled) return;
                const allowance = guest.plusOneAllowed ? guest.plusOneCount ?? 0 : 0;
                setPartyInfo({ allowance, childrenAllowed: false, selectedWedding: guest.selectedWedding, stdResponded: false });
                setParty(Array.from({ length: allowance }, () => blankMember("adult")));
            } finally {
                if (!cancelled) setPartyLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [guest]);

    // Until a guest sets a person's weddings by hand, that person follows the main choice.
    useEffect(() => {
        const c = attendChoice === "both" || attendChoice === "colombia";
        const f = attendChoice === "both" || attendChoice === "usa";
        setParty((prev) => prev.map((m) => (m.touched ? m : { ...m, attendingColombia: c, attendingFlorida: f })));
    }, [attendChoice, partyLoading]);

    useEffect(() => {
        if (bridal && !confettiFired.current) {
            confettiFired.current = true;
            setTimeout(fireConfetti, 500);
        }
    }, [bridal]);

    const infoWeddingKeys =
        guest?.selectedWedding === "Both"
            ? ["Colombia", "USA"]
            : guest?.selectedWedding
                ? [guest.selectedWedding]
                : [];

    const attendingWeddingKeys: string[] =
        attendChoice === "both" ? ["Colombia", "USA"]
            : attendChoice === "colombia" ? ["Colombia"]
                : attendChoice === "usa" ? ["USA"]
                    : [];

    const isAttendingAnything = attendChoice !== null && attendChoice !== "decline";
    const includesGainesville = attendingWeddingKeys.includes("USA");

    const showDeclineNote = choiceMode === "both-choice" && attendChoice === "decline";

    // Eligibility mirrors the server: no selected wedding means "may pick either".
    const sel = partyInfo?.selectedWedding ?? guest?.selectedWedding ?? null;
    const eligibleColombia = sel == null || sel === "Colombia" || sel === "Both";
    const eligibleFlorida = sel == null || sel === "USA" || sel === "Both";

    const allowance = partyInfo?.allowance ?? 0;
    const childrenAllowed = partyInfo?.childrenAllowed ?? false;
    const adults = party.filter((m) => m.memberType === "adult");
    const children = party.filter((m) => m.memberType === "child");
    const adultSpotsLeft = Math.max(0, allowance - adults.length);
    const canAddChild = childrenAllowed && children.length < MAX_CHILDREN;

    const showPartyBlock = isAttendingAnything && !partyLoading && (allowance > 0 || childrenAllowed || party.length > 0);

    const adultsMissingName = party.some((m) => m.memberType === "adult" && !m.fullName.trim());

    const colombiaTotal = (attendingWeddingKeys.includes("Colombia") ? 1 : 0) + party.filter((m) => m.attendingColombia).length;
    const floridaTotal = (includesGainesville ? 1 : 0) + party.filter((m) => m.attendingFlorida).length;
    const partyTotal = isAttendingAnything
        ? 1 + party.filter((m) => m.attendingColombia || m.attendingFlorida).length
        : 0;

    const showMailingAddress = isAttendingAnything && includesGainesville;
    const showPassportQuestion =
        attendingWeddingKeys.includes("Colombia") ||
        party.some((member) => member.attendingColombia);

    const canSubmit =
        attendChoice !== null &&
        (attendChoice === "decline" || (phone.trim() && email.trim() && !adultsMissingName));

    const updateMember = (key: string, patch: Partial<PartyMember>) =>
        setParty((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)));
    const removeMember = (key: string) => setParty((prev) => prev.filter((m) => m.key !== key));
    const addMember = (memberType: "adult" | "child") => {
        const base = blankMember(memberType);
        const c = attendChoice === "both" || attendChoice === "colombia";
        const f = attendChoice === "both" || attendChoice === "usa";
        setParty((prev) => [...prev, { ...base, attendingColombia: c, attendingFlorida: f }]);
    };

    const completeSubmission = () => {
        if (isAttendingAnything) fireConfetti();
        setDone(true);
        setTimeout(() => router.push(`/?guest=${guest?.id}`), 2500);
    };

    const sendConfirmationEmail = async (skipInternalNotification: boolean) => {
        const emailRes = await fetch("/api/send-confirmation-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                guestId: guest?.id,
                language: lang,
                skipInternalNotification,
            }),
        });

        const result = await emailRes.json();
        if (
            !emailRes.ok ||
            result?.success !== true ||
            (isAttendingAnything && result?.guestEmail?.success !== true)
        ) {
            throw new Error("Confirmation email was not accepted by the email provider.");
        }
    };

    const handleSubmit = async () => {
        if (!guest) return;
        if (confirmationPending) {
            setSubmitting(true);
            setConfirmationError(false);
            try {
                await sendConfirmationEmail(true);
                setConfirmationPending(false);
                completeSubmission();
            } catch (emailError) {
                console.error("[Email Retry Error]:", emailError);
                setConfirmationError(true);
            } finally {
                setSubmitting(false);
            }
            return;
        }
        if (isAttendingAnything && adultsMissingName) {
            setShowNameErrors(true);
            return;
        }
        if (!canSubmit) return;
        setSubmitting(true);

        const partyPayload = isAttendingAnything
            ? party.map((m) => ({
                fullName: m.fullName.trim(),
                memberType: m.memberType,
                age: m.memberType === "child" && m.age.trim() !== "" ? Number(m.age) : null,
                attendingColombia: m.attendingColombia,
                attendingFlorida: m.attendingFlorida,
            }))
            : undefined;

        try {
            // Step 1: Save RSVP / STD to DB
            const res = await fetch("/api/std-rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: guest.id,
                    attending: isAttendingAnything,
                    attendingWeddings: attendingWeddingKeys,
                    party: partyPayload,
                    phone: isAttendingAnything ? phone : undefined,
                    email: isAttendingAnything ? email : undefined,
                    mailingAddress: showMailingAddress ? mailingAddress : undefined,
                    smsConsent: isAttendingAnything ? smsConsent : false,
                    declineNote: showDeclineNote ? declineNote : undefined,
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(lang === "es" ? t.submissionFailed : json.error ?? t.submissionFailed);

            // Step 2: Update local state session
            sessionStorage.setItem(
                "guest",
                JSON.stringify({
                    ...guest,
                    email: email.trim() || guest.email,
                    phone: phone.trim() || guest.phone,
                    stdResponded: true,
                    stdAttendingColombia: attendingWeddingKeys.includes("Colombia"),
                    stdAttendingFlorida: attendingWeddingKeys.includes("USA"),
                    guestCount: json.guestCount ?? partyTotal,
                    mailingAddress: showMailingAddress ? mailingAddress : guest.mailingAddress,
                })
            );

            // Step 3: Send the confirmation before completing the RSVP flow.
            setConfirmationPending(true);
            try {
                await sendConfirmationEmail(false);
                setConfirmationPending(false);
                completeSubmission();
            } catch (emailError) {
                console.error("[Email Dispatch Error]:", emailError);
                setConfirmationError(true);
            }

        } catch (err: any) {
            alert(lang === "es" ? "Ocurrió un error al guardar tu respuesta. Inténtalo de nuevo." : err.message ?? "Something went wrong saving your response. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <div className="rounded-2xl p-8 text-center max-w-sm" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                    <p className="text-sm" style={{ color: `${NAVY}99` }}>{loadError}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-5 px-7 py-3 rounded-full text-xs uppercase tracking-[0.15em]"
                        style={{ backgroundColor: APRICOT, color: "#fff" }}
                    >
                        {t.backToLogin}
                    </button>
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                <Loader2 size={24} className="animate-spin" style={{ color: APRICOT }} />
            </div>
        );
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: IVORY }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-10 text-center max-w-sm"
                    style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                        style={{ background: isAttendingAnything ? `radial-gradient(circle at 38% 38%, ${APRICOT}, #d99a63)` : SAND_LIGHT }}
                    >
                        {isAttendingAnything ? <CheckCircle size={28} style={{ color: "#fff" }} /> : <span className="text-2xl">🌸</span>}
                    </motion.div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.9rem", fontWeight: 300, color: NAVY }}>
                        {isAttendingAnything ? t.thankYou : t.missYou}
                    </h2>
                    {isAttendingAnything && email.trim() && (
                        <p className="mt-3 text-xs leading-relaxed" style={{ color: `${NAVY}68` }}>
                            {t.submittedThanks} <span style={{ color: NAVY, fontWeight: 500 }}>{email.trim()}</span> {t.emailSent}
                        </p>
                    )}
                    {!isAttendingAnything && (
                        <div className="mt-4 flex items-start gap-2.5 text-left p-4 rounded-xl" style={{ backgroundColor: SAND_LIGHT }}>
                            <Gift size={15} style={{ color: APRICOT, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-xs leading-relaxed" style={{ color: `${NAVY}68` }}>
                                {t.registryNudge}
                            </p>
                        </div>
                    )}
                    <p className="mt-4 text-sm" style={{ color: `${NAVY}66` }}>{t.redirectHome}</p>
                </motion.div>
            </div>
        );
    }

    // Intro line for the party block, based on what we reserved for this guest
    const partyIntro =
        allowance === 1 ? t.partyIntroOne
            : allowance > 1 ? t.partyIntroMany.replace("{count}", String(allowance))
                : t.partyIntroNone;

    let adultNumber = 0;
    let childNumber = 0;

    return (
        <div className="min-h-screen" style={{ backgroundColor: IVORY }}>
            <div className="max-w-lg mx-auto px-5 pt-20 pb-20">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                    {/* Cinematic hero */}
                    <div
                        className="relative rounded-2xl overflow-hidden mb-7 p-7 sm:p-9"
                        style={{ background: `linear-gradient(140deg, ${NAVY} 0%, #0a2438 100%)` }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.14]"
                            style={{
                                backgroundImage: `radial-gradient(circle at 20% 50%, ${APRICOT}, transparent 50%), radial-gradient(circle at 80% 30%, ${bridal ? "#ec4899" : SKY}, transparent 50%)`,
                            }}
                        />
                        <div className="relative z-10">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[0.58rem] uppercase tracking-[0.3em] mb-4"
                                style={{ color: bridal ? "#f9a8d4" : APRICOT }}
                            >
                                {bridal ? t.bridalBadge : t.saveDate}
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.85rem, 5vw, 2.5rem)", fontWeight: 300, color: IVORY, lineHeight: 1.05 }}
                            >
                                {t.welcome}, <span translate="no">{guest.firstName}</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="mt-4 text-sm leading-relaxed"
                                style={{ color: "rgba(255,247,236,0.72)" }}
                            >
                                {bridal
                                    ? t.bridalIntro
                                    : choiceMode === "both-choice"
                                        ? t.bothIntro
                                        : t.singleIntro}
                            </motion.p>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 text-xs italic" style={{ color: APRICOT }}>
                                — Jhoana &amp; Damariel
                            </motion.p>
                        </div>
                    </div>

                    {/* Wedding date cards */}
                    <div className="space-y-2.5 mb-3">
                        {infoWeddingKeys.map((key) => {
                            const info = WEDDING_INFO[key];
                            if (!info) return null;
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-4 p-4 rounded-xl"
                                    style={{ backgroundColor: `${info.color}18`, border: `1px solid ${info.color}44` }}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: info.color }}>
                                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "0.6rem", color: NAVY }}>
                                            {key === "Colombia" ? "COL" : "GNV"}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium" style={{ color: NAVY }}>{key === "Colombia" ? t.weddingLabels.colombia : t.weddingLabels.florida}</p>
                                        <p className="text-sm" style={{ color: NAVY }}>{formatLocalizedDate(info.date, lang)} · {info.place}</p>
                                    </div>
                                    <Calendar size={13} style={{ color: `${NAVY}40` }} />
                                </div>
                            );
                        })}
                    </div>

                    {infoWeddingKeys.includes("USA") && (
                        <div
                            className="rounded-xl p-4 mb-7 flex items-start gap-2.5"
                            style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}44` }}
                        >
                            <Home size={14} style={{ color: APRICOT, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-xs leading-relaxed" style={{ color: `${NAVY}90` }}>
                                {t.intimateNotice}
                            </p>
                        </div>
                    )}

                    <div className="rounded-xl p-4 mb-7 flex items-start gap-2.5" style={{ backgroundColor: `${NAVY}05`, border: `1px solid ${NAVY}10` }}>
                        <Heart size={13} style={{ color: `${NAVY}55`, marginTop: 2, flexShrink: 0 }} />
                        <p className="text-xs leading-relaxed" style={{ color: `${NAVY}75` }}>
                            {t.familyNotice}
                        </p>
                    </div>

                    {(choiceMode === "single-colombia" || choiceMode === "single-usa") && (
                        <div className="space-y-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice(choiceMode === "single-colombia" ? "colombia" : "usa")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${isAttendingAnything ? APRICOT : `${NAVY}12`}`,
                                    backgroundColor: isAttendingAnything ? `${APRICOT}14` : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            {t.accept}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>{t.acceptNote}</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("decline")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "decline" ? MUTED : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "decline" ? SAND_LIGHT : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🌸</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.3rem", fontWeight: 400, color: NAVY }}>
                                            {t.declineChoice}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>{t.declineNote}</p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    )}

                    {choiceMode === "both-choice" && (
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("both")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "both" ? (bridal ? "#ec4899" : APRICOT) : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "both" ? (bridal ? "#ec489914" : `${APRICOT}14`) : "#fff",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">🎉</span>
                                    <div>
                                        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                            {t.bothChoice}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: `${NAVY}68` }}>{t.bothChoiceNote}</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("colombia")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "colombia" ? SKY : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "colombia" ? `${SKY}20` : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🌎 {t.colombiaOnly}
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>{formatLocalizedDate(new Date(2027, 5, 12), lang)} · Manizales</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("usa")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "usa" ? APRICOT : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "usa" ? `${APRICOT}14` : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🐊 {t.floridaOnly}
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>{formatLocalizedDate(new Date(2027, 3, 24), lang)} · {lang === "es" ? "Florida (celebración íntima)" : "Florida (micro-intimate)"}</p>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setAttendChoice("decline")}
                                className="w-full rounded-2xl p-5 text-left transition-all"
                                style={{
                                    border: `2px solid ${attendChoice === "decline" ? MUTED : `${NAVY}12`}`,
                                    backgroundColor: attendChoice === "decline" ? SAND_LIGHT : "#fff",
                                }}
                            >
                                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.2rem", fontWeight: 400, color: NAVY }}>
                                    🌸 {t.decline}
                                </p>
                                <p className="text-xs mt-1" style={{ color: `${NAVY}68` }}>{t.declineNote}</p>
                            </motion.button>
                        </div>
                    )}

                    {/* Your party — you, the guests we've reserved for you, and any children */}
                    {showPartyBlock && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em] mb-2" style={{ color: `${NAVY}60` }}>
                                {t.partyTitle}
                            </p>
                            <p className="text-xs mb-1" style={{ color: `${NAVY}70` }}>{partyIntro}</p>
                            {childrenAllowed && allowance > 0 && (
                                <p className="text-xs mb-1" style={{ color: `${NAVY}70` }}>{t.kidsNote}</p>
                            )}
                            {includesGainesville && (
                                <p className="text-xs mb-1" style={{ color: `${NAVY}70` }}>{t.fixedGuestCount}</p>
                            )}

                            <div className="space-y-3 mt-4">
                                {/* You */}
                                <div className="rounded-xl p-4" style={{ backgroundColor: `${APRICOT}14`, border: `1px solid ${APRICOT}55` }}>
                                    <p className="text-[0.6rem] uppercase tracking-[0.16em] flex items-center gap-1.5 mb-1" style={{ color: `${NAVY}80` }}>
                                        <Heart size={12} style={{ color: APRICOT, fill: APRICOT }} /> {t.you}
                                    </p>
                                    <p className="text-sm mb-3" style={{ color: NAVY }} translate="no">
                                        {guest.firstName} {guest.lastName}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {eligibleColombia && (
                                            <WeddingChip label={t.colombiaShort} color={SKY} on={attendingWeddingKeys.includes("Colombia")} readOnly />
                                        )}
                                        {eligibleFlorida && (
                                            <WeddingChip label={t.floridaShort} color={APRICOT} on={attendingWeddingKeys.includes("USA")} readOnly />
                                        )}
                                    </div>
                                </div>

                                {party.map((m) => {
                                    const isChild = m.memberType === "child";
                                    const n = isChild ? ++childNumber : ++adultNumber;
                                    const title = (isChild ? t.childLabel : t.guestLabel).replace("{n}", String(n));
                                    return (
                                        <PartyRow
                                            key={m.key}
                                            title={title}
                                            member={m}
                                            eligibleColombia={eligibleColombia}
                                            eligibleFlorida={eligibleFlorida}
                                            t={t}
                                            nameMissing={showNameErrors && !isChild && !m.fullName.trim()}
                                            onChange={(patch) => updateMember(m.key, patch)}
                                            onRemove={() => removeMember(m.key)}
                                        />
                                    );
                                })}
                            </div>

                            {(adultSpotsLeft > 0 || canAddChild) && (
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    {adultSpotsLeft > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => addMember("adult")}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.62rem] uppercase tracking-[0.12em] hover:opacity-80"
                                            style={{ border: `1.5px dashed ${APRICOT}`, color: NAVY }}
                                        >
                                            <Plus size={12} /> {t.addGuest}
                                        </button>
                                    )}
                                    {canAddChild && (
                                        <button
                                            type="button"
                                            onClick={() => addMember("child")}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.62rem] uppercase tracking-[0.12em] hover:opacity-80"
                                            style={{ border: `1.5px dashed ${SKY}`, color: NAVY }}
                                        >
                                            <Baby size={12} /> {t.addChild}
                                        </button>
                                    )}
                                    {adultSpotsLeft > 0 && (
                                        <span className="text-[0.6rem]" style={{ color: `${NAVY}60` }}>
                                            {t.spotsLeft.replace("{count}", String(adultSpotsLeft))}
                                        </span>
                                    )}
                                </div>
                            )}

                            {showNameErrors && adultsMissingName && (
                                <p className="text-xs mt-3" role="alert" style={{ color: WARN }}>{t.namesRequired}</p>
                            )}

                            {/* Live totals */}
                            <div className="mt-5 pt-4 flex flex-wrap items-center justify-between gap-2 border-t" style={{ borderColor: SAND }}>
                                <p className="text-xs" style={{ color: NAVY }}>
                                    {t.partyTotal}: <span style={{ fontWeight: 600 }}>{partyTotal} {partyTotal === 1 ? t.person : t.people}</span>
                                </p>
                                {eligibleColombia && eligibleFlorida && (
                                    <p className="text-[0.65rem]" style={{ color: `${NAVY}70` }}>
                                        {t.colombiaShort}: {colombiaTotal} · {t.floridaShort}: {floridaTotal}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {showPassportQuestion && (
                        <div className="rounded-2xl p-5 mb-5 space-y-3" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="text-sm font-medium" style={{ color: NAVY }}>
                                {t.passportQuestion}
                            </p>
                            <div className="flex flex-wrap gap-5">
                                <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                                    <input
                                        type="radio"
                                        name="passport"
                                        checked={passportAnswer === true}
                                        onChange={() => setPassportAnswer(true)}
                                    />
                                    {t.passportYes}
                                </label>
                                <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                                    <input
                                        type="radio"
                                        name="passport"
                                        checked={passportAnswer === false}
                                        onChange={() => setPassportAnswer(false)}
                                    />
                                    {t.passportNo}
                                </label>
                            </div>
                            {passportAnswer === true && (
                                <p className="text-xs leading-relaxed" style={{ color: `${NAVY}70` }}>
                                    {t.passportHelp}{" "}
                                    <a
                                        href="https://travel.state.gov/en/passports/apply.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                        style={{ color: NAVY }}
                                    >
                                        {t.passportApply}
                                    </a>
                                </p>
                            )}
                        </div>
                    )}

                    {isAttendingAnything && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5 space-y-4" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: `${NAVY}60` }}>
                                {t.updates}
                            </p>
                            <p className="text-xs -mt-2" style={{ color: `${NAVY}70` }}>
                                {t.updatesNote}
                            </p>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>
                                    <Mail size={11} style={{ color: APRICOT }} /> {t.email}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>
                                    <PhoneIcon size={11} style={{ color: APRICOT }} /> {t.phone}
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                                />
                            </div>

                            {showMailingAddress && (
                                <div>
                                    <label className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] mb-2" style={{ color: `${NAVY}60` }}>
                                        <MapPin size={11} style={{ color: APRICOT }} /> {t.mailingAddress}
                                    </label>
                                    <p className="text-[0.68rem] -mt-1 mb-2" style={{ color: `${NAVY}60` }}>
                                        {t.mailingNote}
                                    </p>
                                    <textarea
                                        rows={2}
                                        value={mailingAddress}
                                        onChange={(e) => setMailingAddress(e.target.value)}
                                        placeholder={t.mailingPlaceholder}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                        style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                                    />
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-4 pt-2 border-t" style={{ borderColor: SAND }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${APRICOT}22` }}>
                                        <Bell size={14} style={{ color: APRICOT }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: NAVY }}>{t.smsTitle}</p>
                                        <p className="text-[0.65rem] mt-0.5" style={{ color: `${NAVY}60` }}>{t.smsOptional}</p>
                                    </div>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={smsConsent}
                                    onClick={() => setSmsConsent(!smsConsent)}
                                    className="flex-shrink-0 w-10 h-6 rounded-full relative transition-colors mt-0.5"
                                    style={{ backgroundColor: smsConsent ? APRICOT : SAND }}
                                >
                                    <motion.div
                                        animate={{ x: smsConsent ? 18 : 2 }}
                                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>
                            <p className="text-[0.58rem] leading-relaxed" style={{ color: `${NAVY}50` }}>
                                {t.smsDisclosure}{" "}
                                <a href="/terms" className="underline" style={{ color: `${NAVY}70` }}>{t.terms}</a>
                                {" "}{lang === "es" ? "y nuestra" : "and our"}{" "}
                                <a href="/privacy" className="underline" style={{ color: `${NAVY}70` }}>{t.privacy}</a>.
                            </p>
                        </motion.div>
                    )}

                    {showDeclineNote && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}` }}>
                            <label className="text-[0.6rem] uppercase tracking-[0.18em] mb-2 block" style={{ color: `${NAVY}60` }}>
                                {t.reason}
                            </label>
                            <p className="text-xs mb-3" style={{ color: `${NAVY}70` }}>
                                {t.reasonNote}
                            </p>
                            <textarea
                                rows={3}
                                value={declineNote}
                                onChange={(e) => setDeclineNote(e.target.value)}
                                placeholder={t.optionalNote}
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                                style={{ backgroundColor: SAND_LIGHT, border: "1.5px solid transparent", color: NAVY }}
                            />
                        </motion.div>
                    )}

                    {attendChoice !== null && (
                        <>
                            {confirmationError && (
                                <div role="alert" className="mb-4 rounded-xl p-4 text-sm leading-relaxed" style={{ backgroundColor: "#fff", border: `1px solid ${SAND}`, color: NAVY }}>
                                    <p>{t.emailFailure}</p>
                                    <a className="underline" href="mailto:causeycardenas@gmail.com">causeycardenas@gmail.com</a>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleSubmit}
                                disabled={submitting || (!confirmationPending && !canSubmit && !(isAttendingAnything && adultsMissingName && phone.trim() && email.trim()))}
                                className="w-full py-4 rounded-xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                                style={{ backgroundColor: bridal ? "#ec4899" : NAVY, color: IVORY }}
                            >
                                {submitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : confirmationPending ? (
                                    <><Mail size={14} /> {t.retryConfirmation}</>
                                ) : bridal ? (
                                    <><Sparkles size={14} /> {t.confirm}</>
                                ) : (
                                    t.confirm
                                )}
                            </motion.button>
                        </>
                    )}

                    <p className="text-center text-xs mt-8" style={{ color: `${NAVY}55` }}>
                        {t.questions}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function SaveTheDatePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: IVORY }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: APRICOT }} />
                </div>
            }
        >
            <SaveTheDateContent />
        </Suspense>
    );
}