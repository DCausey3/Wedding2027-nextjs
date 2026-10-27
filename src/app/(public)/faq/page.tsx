"use client";

import { useEffect, useState } from "react";
import { FAQAccordion } from "@/components/wedding/FAQAccordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";

// ─── Types ──────────────────────────────────────────────────────────────────
// "both" = only show when the guest can see BOTH weddings
type Region = "colombia" | "florida" | "both";

type FAQItem = { q: string; a: string; region?: Region };
type FAQSection = { category: string; region?: Region; items: FAQItem[] };

// Fields are read defensively because the guest object comes from sessionStorage
// and may use slightly different keys depending on the API mapping.
type Guest = {
    role?: string;
    stdResponded?: boolean | string;
    stdAttendingColombia?: boolean | string;
    stdAttendingFlorida?: boolean | string;
    attendingColombia?: boolean | string;
    attendingFlorida?: boolean | string;
    attendingUsa?: boolean | string;
    selectedWedding?: string;
    selected_wedding?: string;
    eligibleColombia?: boolean | string;
};

function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

type Visibility = { colombia: boolean; florida: boolean; hasGuestContext: boolean };

// Decide which wedding(s) this guest should see information for.
function resolveVisibility(guest: Guest | null): Visibility {
    // No guest session (public visit): show everything.
    if (!guest) return { colombia: true, florida: true, hasGuestContext: false };

    // Bride / Groom (admin) see everything.
    if (guest.role === "Bride" || guest.role === "Groom") {
        return { colombia: true, florida: true, hasGuestContext: true };
    }

    // Guest already answered the save-the-date → follow their actual answers.
    if (isTruthy(guest.stdResponded)) {
        return {
            colombia: isTruthy(guest.stdAttendingColombia) || isTruthy(guest.attendingColombia),
            florida:
                isTruthy(guest.stdAttendingFlorida) ||
                isTruthy(guest.attendingFlorida) ||
                isTruthy(guest.attendingUsa),
            hasGuestContext: true,
        };
    }

    // Not responded yet → follow the wedding(s) they were invited to.
    const invited = String(guest.selectedWedding ?? guest.selected_wedding ?? "")
        .trim()
        .toLowerCase();
    if (invited === "both") return { colombia: true, florida: true, hasGuestContext: true };
    if (invited === "colombia") return { colombia: true, florida: false, hasGuestContext: true };
    if (invited === "usa" || invited === "us" || invited === "florida") {
        return { colombia: false, florida: true, hasGuestContext: true };
    }

    // Unknown → don't hide anything.
    return { colombia: true, florida: true, hasGuestContext: true };
}

function useGuestVisibility() {
    const [visibility, setVisibility] = useState<Visibility>({
        colombia: true,
        florida: true,
        hasGuestContext: false,
    });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let guest: Guest | null = null;
        const stored = sessionStorage.getItem("guest");
        if (stored) {
            try {
                guest = JSON.parse(stored);
            } catch {
                // ignore malformed storage
            }
        }
        setVisibility(resolveVisibility(guest));
        setLoaded(true);
    }, []);

    return { ...visibility, loaded };
}

function isVisible(region: Region | undefined, v: Visibility): boolean {
    if (!region) return true;
    if (region === "colombia") return v.colombia;
    if (region === "florida") return v.florida;
    return v.colombia && v.florida; // "both"
}

// ─── FAQ content ────────────────────────────────────────────────────────────
const ALL_FAQS = [
    {
        category: "General",
        items: [
            {
                q: "Can I attend both weddings?",
                a: "Absolutely! We would love to celebrate with you twice. Some guests are invited to choose one or both — check your invitation for details.",
                region: "both",
            },
            {
                q: "What is the RSVP deadline?",
                a: "Please RSVP by  December 1st, 2026. This helps us finalize guest counts, meals, and travel logistics for both celebrations.",
            },
            {
                q: "How will I get updates about the wedding?",
                a: "We'll send wedding updates by text message to the number on your invitation, and you'll also receive emails once you complete your RSVP. The text number is only used for updates, so please don't reply to it with questions.",
            },
            {
                q: "Can I bring a plus-one?",
                a: "Your invitation shows whether a plus-one is included. If it is, you'll be able to add their name when you RSVP. If you're unsure, please contact us directly.",
            },
            {
                q: "I have dietary restrictions or allergies. What should I do?",
                a: "Please let us know when you RSVP so we can plan meals that work for everyone. If your needs change later, contact us directly.",
            },
            {
                q: "What if I need to change my RSVP or my plans change?",
                a: "No problem. Please reach out to us directly as soon as you know so we can update our guest count and logistics.",
            },
            {
                q: "Will there be transportation between venues?",
                a: "Yes — we have arranged shuttle service from select hotels at both locations. Please indicate shuttle needs on your RSVP form.",
            },
        ],
    },
    {
        category: "Colombia Wedding",
        region: "colombia",
        items: [
            {
                q: "Do I need a visa to enter Colombia?",
                a: "US, Canadian, EU, and UK citizens do not require a visa for stays under 90 days. Check with your country's embassy for specific requirements.",
            },
            {
                q: "Is a passport required?",
                a: "Yes — a valid passport is required for all international travelers to Colombia. Ensure yours is valid for at least 6 months beyond your travel dates.",
            },
            {
                q: "When should I arrive in Colombia?",
                a: "Please plan to arrive at least one day before the wedding to allow for travel delays and give yourself time to rest and settle in.",
            },
            {
                q: "Which airport should I fly into for Colombia?",
                a: "Pereira (PEI) is about an hour by car from Manizales and is the easiest option for most guests. Manizales (MZL) is closest to town but only has domestic flights, usually connecting through Bogotá or Medellín. Please arrange a taxi or private transfer ahead of time.",
            },
            {
                q: "Do I need to know Spanish?",
                a: "Basic to intermediate Spanish is helpful. We will have bilingual staff and a bilingual ceremony, but we strongly encourage you to practice some Spanish before the trip — Duolingo is a great way to learn the basics.",
            },
            {
                q: "What is the dress code for Colombia?",
                a: "Tropical formal / Festive attire. The ceremony is outdoors in a tropical garden. Bridesmaids will wear Coral; groomsmen will wear Sand.",
            },
            {
                q: "What should I pack?",
                a: "Manizales sits high in the Andes, so days are mild and evenings can be cool and rainy. Pack layers, a light jacket, a rain layer, comfortable shoes for garden terrain, and sunscreen. Bring your passport and a copy of your travel documents, and keep them with you rather than in checked luggage.",
            },
            {
                q: "What currency should I bring?",
                a: "The Colombian Peso (COP) is the local currency. Credit cards are widely accepted. We recommend bringing some cash for local experiences.",
            },
            {
                q: "Will my phone work in Colombia?",
                a: "Check with your carrier about an international plan, or consider a travel eSIM before you leave. Hotel Wi-Fi is typically available, but it's good to have a backup.",
            },
            {
                q: "Do I need any vaccinations or travel insurance?",
                a: "Requirements vary by traveler and by region, so please check the CDC's travel health notices for Colombia and talk with your doctor before you go. We also recommend travel insurance that covers trip cancellation and medical care abroad.",
            },
        ],
    },
    {
        category: "USA Wedding",
        region: "florida",
        items: [
            {
                q: "Which airport should I fly into?",
                a: "Gainesville Regional Airport (GNV) is the closest. Jacksonville (JAX) is about 1 hour 15 minutes away, and Orlando (MCO) and Tampa (TPA) are roughly 2 hours away, so plan on a rental car if you choose one of those.",
            },
            {
                q: "Do I need a rental car?",
                a: "If you fly into Gainesville and stay at one of our recommended hotels, you may be able to rely on the shuttle service. If you fly into Orlando or Tampa, we recommend a rental car for the drive to Gainesville.",
            },
            {
                q: "What is the dress code for the USA wedding?",
                a: "Black tie / Formal attire. Women: floor-length gowns or formal cocktail dresses. Men: tuxedo or dark formal suit. Bridesmaids in Terracotta; groomsmen in Sand.",
            },
            {
                q: "What will the weather be like in April?",
                a: "Gainesville is typically warm and humid in late April, with the occasional spring shower. Check the forecast a few days before you travel and pack accordingly.",
            },
            {
                q: "Is there parking at the venue?",
                a: "The Baughman Center is on the University of Florida campus and its parking is limited. We'll share parking instructions before the wedding, so consider carpooling or using a rideshare.",
            },
        ],
    },
    {
        category: "Accommodations",
        items: [
            {
                q: "Where should I stay in Colombia?",
                a: "We're finalizing hotel recommendations and room blocks for Manizales. Check the Colombia wedding page for the latest travel information. If you'd like to book on your own now, Manizales is the closest city to the venue.",
                region: "colombia",
            },
            {
                q: "Where should I stay in Gainesville?",
                a: "Room block details for Gainesville are coming soon. Check the Florida wedding page for the latest travel information. If you'd like to book now, options near the university include the Hilton University of Florida Conference Center, Hilton Garden Inn Gainesville, and Sweetwater Branch Inn downtown. Gainesville hotels fill up on busy university weekends, so booking early is wise.",
                region: "florida",
            },
        ],
    },
    {
        category: "Registry & Gifts",
        items: [
            {
                q: "Where are you registered?",
                a: "We are registered on Zola (primary), Williams-Sonoma, Crate & Barrel, and Honeyfund for our honeymoon. See our Registry page for links.",
            },
            {
                q: "Should I bring a gift to the wedding?",
                a: "Please don't bring physical gifts to either venue — we'd love for you to travel light! Gifts can be shipped to our home address (provided on Zola).",
            },
        ],
    },
] as const satisfies FAQSection[];

type FAQQuestion = (typeof ALL_FAQS)[number]["items"][number]["q"];
const FAQ_SPANISH: Record<FAQQuestion, { question: string; answer: string }> = {
    "Can I attend both weddings?": {
        question: "¿Puedo asistir a las dos bodas?",
        answer: "¡Claro que sí! Nos encantaría celebrar contigo dos veces. Algunas personas pueden elegir una o ambas bodas; revisa tu invitación para ver los detalles.",
    },
    "What is the RSVP deadline?": {
        question: "¿Cuál es la fecha límite para confirmar mi asistencia?",
        answer: "Confirma tu asistencia antes del 1 de diciembre de 2026. Esto nos ayudará a organizar la cantidad de invitados, las comidas y los viajes para ambas celebraciones.",
    },
    "How will I get updates about the wedding?": {
        question: "¿Cómo recibiré novedades sobre la boda?",
        answer: "Enviaremos novedades por mensaje de texto al número de tu invitación y también recibirás correos electrónicos después de confirmar tu asistencia. El número de texto solo se usa para enviar novedades; por favor, no respondas con preguntas.",
    },
    "Can I bring a plus-one?": {
        question: "¿Puedo llevar un acompañante?",
        answer: "Tu invitación indica si incluye un acompañante. Si es así, podrás agregar su nombre al confirmar tu asistencia. Si tienes dudas, contáctanos directamente.",
    },
    "I have dietary restrictions or allergies. What should I do?": {
        question: "Tengo restricciones alimentarias o alergias. ¿Qué debo hacer?",
        answer: "Cuéntanos al confirmar tu asistencia para que podamos planear comidas adecuadas para todos. Si tus necesidades cambian, contáctanos directamente.",
    },
    "What if I need to change my RSVP or my plans change?": {
        question: "¿Qué hago si necesito cambiar mi confirmación o mis planes?",
        answer: "No hay problema. Avísanos directamente tan pronto como puedas para que actualicemos la cantidad de invitados y la logística.",
    },
    "Will there be transportation between venues?": {
        question: "¿Habrá transporte entre los lugares de celebración?",
        answer: "Sí. Hemos organizado transporte desde algunos hoteles en ambas ciudades. Indica si necesitas transporte en el formulario de confirmación.",
    },
    "Do I need a visa to enter Colombia?": {
        question: "¿Necesito visa para entrar a Colombia?",
        answer: "Los ciudadanos de Estados Unidos, Canadá, la Unión Europea y el Reino Unido no necesitan visa para estadías menores a 90 días. Consulta con la embajada de tu país para conocer los requisitos específicos.",
    },
    "Is a passport required?": {
        question: "¿Necesito pasaporte?",
        answer: "Sí. Todas las personas que viajen a Colombia desde el extranjero necesitan un pasaporte vigente. Asegúrate de que tenga al menos seis meses de vigencia después de tus fechas de viaje.",
    },
    "When should I arrive in Colombia?": {
        question: "¿Cuándo debería llegar a Colombia?",
        answer: "Te recomendamos llegar al menos un día antes de la boda para prevenir inconvenientes por retrasos y tener tiempo para descansar y acomodarte.",
    },
    "Which airport should I fly into for Colombia?": {
        question: "¿A qué aeropuerto debería volar en Colombia?",
        answer: "Pereira (PEI) está a aproximadamente una hora en auto de Manizales y es la opción más práctica para la mayoría. Manizales (MZL) está más cerca, pero solo recibe vuelos nacionales, normalmente con conexión en Bogotá o Medellín. Reserva un taxi o transporte privado con anticipación.",
    },
    "Do I need to know Spanish?": {
        question: "¿Necesito saber español?",
        answer: "Es útil tener un nivel básico o intermedio de español. Tendremos personal bilingüe y una ceremonia bilingüe, pero te recomendamos practicar un poco antes del viaje. Duolingo es una buena forma de aprender lo básico.",
    },
    "What is the dress code for Colombia?": {
        question: "¿Cuál es el código de vestimenta para la boda en Colombia?",
        answer: "Vestimenta formal tropical o festiva. La ceremonia será al aire libre, en un jardín tropical. Las damas de honor vestirán de coral y los padrinos de arena.",
    },
    "What should I pack?": {
        question: "¿Qué debería empacar?",
        answer: "Manizales está en lo alto de los Andes: los días son templados y las noches pueden ser frescas y lluviosas. Lleva varias capas, una chaqueta ligera, ropa para la lluvia, zapatos cómodos para caminar por el jardín y protector solar. Lleva tu pasaporte y una copia de tus documentos de viaje; no los guardes en el equipaje facturado.",
    },
    "What currency should I bring?": {
        question: "¿Qué moneda debería llevar?",
        answer: "La moneda local es el peso colombiano (COP). Se aceptan ampliamente las tarjetas de crédito, pero recomendamos llevar algo de efectivo para actividades locales.",
    },
    "Will my phone work in Colombia?": {
        question: "¿Funcionará mi teléfono en Colombia?",
        answer: "Consulta con tu compañía telefónica sobre un plan internacional o considera comprar una eSIM de viaje antes de salir. Los hoteles suelen tener Wi-Fi, pero es buena idea contar con una alternativa.",
    },
    "Do I need any vaccinations or travel insurance?": {
        question: "¿Necesito vacunas o seguro de viaje?",
        answer: "Los requisitos dependen de cada viajero y región. Consulta las recomendaciones de salud para viajeros de los CDC sobre Colombia y habla con tu médico antes de viajar. También recomendamos un seguro que cubra cancelaciones y atención médica en el extranjero.",
    },
    "Which airport should I fly into?": {
        question: "¿A qué aeropuerto debería volar?",
        answer: "El Aeropuerto Regional de Gainesville (GNV) es el más cercano. Jacksonville (JAX) está a unos 75 minutos, y Orlando (MCO) y Tampa (TPA) a unas dos horas; considera alquilar un auto si eliges uno de estos últimos.",
    },
    "Do I need a rental car?": {
        question: "¿Necesito alquilar un auto?",
        answer: "Si vuelas a Gainesville y te hospedas en uno de los hoteles recomendados, quizá puedas usar el transporte organizado. Si vuelas a Orlando o Tampa, recomendamos alquilar un auto para llegar a Gainesville.",
    },
    "What is the dress code for the USA wedding?": {
        question: "¿Cuál es el código de vestimenta para la boda en Estados Unidos?",
        answer: "Etiqueta rigurosa o vestimenta formal. Mujeres: vestidos largos o vestidos formales de cóctel. Hombres: esmoquin o traje formal oscuro. Las damas de honor vestirán terracota y los padrinos, arena.",
    },
    "What will the weather be like in April?": {
        question: "¿Cómo suele estar el clima en abril?",
        answer: "Gainesville suele ser cálido y húmedo a finales de abril, con lluvias ocasionales. Consulta el pronóstico unos días antes del viaje y empaca según el clima.",
    },
    "Is there parking at the venue?": {
        question: "¿Hay estacionamiento en el lugar de la boda?",
        answer: "El Baughman Center está en el campus de la Universidad de Florida y tiene estacionamiento limitado. Compartiremos las indicaciones antes de la boda; considera compartir auto o usar transporte por aplicación.",
    },
    "Where should I stay in Colombia?": {
        question: "¿Dónde debería hospedarme en Colombia?",
        answer: "Estamos finalizando las recomendaciones de hoteles y los bloques de habitaciones en Manizales. Consulta la página de la boda en Colombia para ver la información de viaje más reciente. Si quieres reservar desde ahora, Manizales es la ciudad más cercana al lugar de la boda.",
    },
    "Where should I stay in Gainesville?": {
        question: "¿Dónde debería hospedarme en Gainesville?",
        answer: "Pronto compartiremos información sobre los bloques de habitaciones. Consulta la página de la boda en Florida para ver la información de viaje más reciente. Cerca de la universidad puedes encontrar el Hilton University of Florida Conference Center, el Hilton Garden Inn Gainesville y el Sweetwater Branch Inn, en el centro. Los hoteles suelen llenarse durante los fines de semana universitarios, así que reserva con tiempo.",
    },
    "Where are you registered?": {
        question: "¿Dónde tienen listas de regalos?",
        answer: "Tenemos listas en Zola, Williams-Sonoma, Crate & Barrel y Honeyfund para nuestra luna de miel. Visita la página de regalos para ver los enlaces.",
    },
    "Should I bring a gift to the wedding?": {
        question: "¿Debería llevar un regalo a la boda?",
        answer: "Por favor, no lleves regalos físicos a ninguno de los lugares; queremos que viajes ligero. Puedes enviar los regalos a nuestra casa (la dirección aparece en Zola).",
    },
};

const FAQ_CATEGORIES: Record<string, string> = {
    General: "General",
    "Colombia Wedding": "Boda en Colombia",
    "USA Wedding": "Boda en Estados Unidos",
};

export default function FAQPage() {
    const visibility = useGuestVisibility();
    const { lang } = useLanguage();

    if (!visibility.loaded) return null;

    // Hide any section or question that belongs to a wedding this guest isn't attending.
    const sourceFaqs: readonly FAQSection[] = ALL_FAQS;
    const faqs = sourceFaqs
        .filter((section) => isVisible(section.region, visibility))
        .map((section) => ({
            category: lang === "es" ? FAQ_CATEGORIES[section.category] ?? section.category : section.category,
            items: section.items
                .filter((item) => isVisible(item.region, visibility))
                .map(({ q, a }) => ({
                    q: lang === "es" ? FAQ_SPANISH[q as FAQQuestion].question : q,
                    a: lang === "es" ? FAQ_SPANISH[q as FAQQuestion].answer : a,
                })),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <div style={{ backgroundColor: IVORY }}>
            <div className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: SKY_DEEP }}>
                <p className="label-overline mb-4" style={{ color: APRICOT }}>{lang === "es" ? "¿Tienes preguntas?" : "Got Questions?"}</p>
                <h1 className="heading-display" style={{ color: IVORY }}>
                    {lang === "es" ? "Preguntas" : "Frequently Asked"}{" "}
                    <span className="italic" style={{ color: APRICOT }}>{lang === "es" ? "frecuentes" : "Questions"}</span>
                </h1>
            </div>

            <section className="section-pad">
                <div className="max-w-3xl mx-auto">
                    <SectionHeader overline={lang === "es" ? "Tenemos las respuestas" : "We've Got Answers"} title={lang === "es" ? "Todo lo que" : "Everything You"} titleItalic={lang === "es" ? "debes saber" : "Need to Know"} className="mb-14" />
                    <FAQAccordion categories={faqs} />
                    <div className="mt-14 p-8 rounded-2xl text-center" style={{ backgroundColor: SAND_LIGHT }}>
                        <p className="font-serif text-xl font-light mb-2" style={{ color: SKY_DEEP }}>{lang === "es" ? "¿Todavía tienes preguntas?" : "Still have questions?"}</p>
                        <p className="text-sm mb-5" style={{ color: `${SKY_DEEP}99` }}>{lang === "es" ? "Con gusto te ayudaremos con cualquier tema que no hayamos cubierto aquí." : "We're happy to help with anything we haven't covered here."}</p>
                        <Link
                            href="/contact"
                            className="inline-block px-8 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90"
                            style={{ backgroundColor: APRICOT, color: SKY_DEEP, letterSpacing: "0.15em" }}
                        >
                            {lang === "es" ? "Contáctanos" : "Contact Us"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}