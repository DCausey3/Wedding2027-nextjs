"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Gift, Send, Home, Heart, Sparkles, Plane, Copy, Check, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage, type Language } from "@/components/providers/LanguageProvider";

// ─── Palette — Sky Blue + Apricot + Ivory + Sand ───────────────────────────
const SKY_DEEP = "#123B54";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const SAND_LIGHT = "#F2E8D5";
const APRICOT = "#FFB482";
const SKY = "#A4D4F4";
const SKY_MID = "#5FA8D3";

// ─── Zelle ──────────────────────────────────────────────────────────────────
// Add your Zelle QR image to /public and match the file name here.
const ZELLE_QR = "/QR.png";
const ZELLE_EMAIL = "causeycardenas@gmail.com"; // double-check this spelling before publishing

const REGISTRIES = [
    { id: "kitchen", store: "Williams-Sonoma", url: "https://www.williams-sonoma.com/registry/6rb6pqdxw9/registry-list.html", icon: Home, color: SKY_MID, featured: true },
    { id: "everyday", store: "Amazon", url: "https://www.amazon.com/wedding/guest-view/1MMDQ63OJ0LY", icon: Gift, color: SKY, featured: true },
] as const;

const COPY_EN = {
        languageLabel: "Choose language",
        english: "English",
        spanish: "Español",
        heroOverline: "You're Spoiling Us Already",
        heroTitle: "Registry &",
        heroTitleItalic: "Gifts",
        heroDescription: "Honestly? Just showing up is the gift. But if you're the type who can't come empty-handed (we see you, and we love you for it), here's everything you need.",
        quote: "We are already so full of gratitude just knowing you'll be celebrating with us.",
        honeymoonOverline: "Help Us Take Off",
        honeymoonTitle: "Our Honeymoon",
        honeymoonTitleItalic: "Fund",
        scanZelle: "Scan to send with Zelle",
        qrFallback: "QR code coming soon. Use the email instead.",
        qrAlt: "Zelle QR code for our honeymoon fund",
        sendUs: "Send us",
        sendUsItalic: "off in style",
        zelleEmail: "Zelle email",
        copyEmail: "Copy Zelle email",
        copy: "Copy",
        copied: "Copied",
        zelleSteps: [
            "Open your banking app and choose Zelle",
            "Scan the QR code, or send to our email",
            "Add a note like “Honeymoon 💛”",
        ],
        checkEmail: "Please double-check the email before you hit send.",
        registriesOverline: "If You'd Rather Wrap Something",
        registriesTitle: "Our",
        registriesTitleItalic: "Registries",
        registryDetails: {
            kitchen: {
                category: "Kitchen & Entertaining",
                description: "We love to cook together — help us fill our kitchen with the tools to keep making memories.",
            },
            everyday: {
                category: "Everyday Essentials",
                description: "Everything else on our list, from small home essentials to a few fun extras.",
            },
        },
        viewRegistry: "View Registry",
        registryLinkLabel: "Registry — opens in new tab",
        tipsOverline: "Good to Know",
        tipsTitle: "Gift",
        tipsTitleItalic: "Tips",
        tips: [
            {
                title: "No gifts at the venue",
                body: "Please don't bring physical gifts to either wedding — travel light and enjoy the celebration!",
            },
            {
                title: "Ship to our home",
                body: "All registry gifts can be shipped directly to us. Our address is provided at checkout on each registry.",
            },
            {
                title: "Cards are welcome",
                body: "A handwritten note means more than any gift. There will be a card box at both venues.",
            },
        ],
};

const COPY_ES: typeof COPY_EN = {
        languageLabel: "Elige un idioma",
        english: "English",
        spanish: "Español",
        heroOverline: "¡Ya nos están consintiendo!",
        heroTitle: "Regalos y",
        heroTitleItalic: "listas",
        heroDescription: "¿La verdad? El mejor regalo es que nos acompañes. Pero si eres de esas personas que no pueden llegar con las manos vacías (te vemos y te queremos por eso), aquí encontrarás todo lo que necesitas.",
        quote: "Ya sentimos muchísima gratitud con solo saber que celebrarás con nosotros.",
        honeymoonOverline: "Ayúdanos a despegar",
        honeymoonTitle: "Fondo para",
        honeymoonTitleItalic: "la luna de miel",
        scanZelle: "Escanea para enviar por Zelle",
        qrFallback: "Próximamente estará disponible el código QR. También puedes usar el correo.",
        qrAlt: "Código QR de Zelle para nuestro fondo de luna de miel",
        sendUs: "Ayúdanos a partir",
        sendUsItalic: "con estilo",
        zelleEmail: "Correo de Zelle",
        copyEmail: "Copiar correo de Zelle",
        copy: "Copiar",
        copied: "Copiado",
        zelleSteps: [
            "Abre la aplicación de tu banco y elige Zelle",
            "Escanea el código QR o envía el dinero a nuestro correo",
            "Agrega una nota como «Luna de miel 💛»",
        ],
        checkEmail: "Verifica el correo antes de enviar el dinero.",
        registriesOverline: "Si prefieres regalarnos algo",
        registriesTitle: "Nuestras",
        registriesTitleItalic: "listas de regalos",
        registryDetails: {
            kitchen: {
                category: "Cocina y reuniones",
                description: "Nos encanta cocinar juntos. Ayúdanos a llenar la cocina de todo lo necesario para seguir creando recuerdos.",
            },
            everyday: {
                category: "Artículos para el día a día",
                description: "Todo lo demás de nuestra lista: desde artículos prácticos para el hogar hasta algunos detalles divertidos.",
            },
        },
        viewRegistry: "Ver lista de regalos",
        registryLinkLabel: "Lista de regalos — se abre en una pestaña nueva",
        tipsOverline: "Información útil",
        tipsTitle: "Consejos para",
        tipsTitleItalic: "regalos",
        tips: [
            {
                title: "No lleves regalos al lugar",
                body: "Por favor, no lleves regalos físicos a ninguna de las dos bodas. Viaja ligero y disfruta de la celebración.",
            },
            {
                title: "Envíalos a nuestra casa",
                body: "Puedes enviar todos los regalos de nuestras listas directamente a casa. Encontrarás nuestra dirección al finalizar la compra.",
            },
            {
                title: "También recibimos tarjetas",
                body: "Una nota escrita a mano significa más que cualquier regalo. Habrá una caja para tarjetas en ambos lugares.",
            },
        ],
};

const COPY = { en: COPY_EN, es: COPY_ES };

function ZelleHoneymoonFund({ language }: { language: Language }) {
    const t = COPY[language];
    const [copied, setCopied] = useState(false);
    const [qrFailed, setQrFailed] = useState(false);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(ZELLE_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable; the email is still shown on screen
        }
    };

    return (
        <section className="section-pad" style={{ backgroundColor: IVORY }}>
            <div className="container-wedding mx-auto">
                <SectionHeader overline={t.honeymoonOverline} title={t.honeymoonTitle} titleItalic={t.honeymoonTitleItalic} className="mb-10" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="max-w-3xl mx-auto rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
                    style={{ backgroundColor: SKY_DEEP, boxShadow: "0 20px 50px rgba(18,59,84,0.2)" }}
                >
                    {/* Left: QR */}
                    <div className="p-8 flex flex-col items-center justify-center text-center" style={{ backgroundColor: "#0e2f43" }}>
                        <p className="uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: APRICOT, fontSize: "0.6rem", letterSpacing: "0.3em" }}>
                            <QrCode size={12} /> {t.scanZelle}
                        </p>
                        <div className="rounded-2xl p-4" style={{ backgroundColor: IVORY }}>
                            {qrFailed ? (
                                <div className="w-48 h-48 flex items-center justify-center text-xs text-center px-4" style={{ color: `${SKY_DEEP}99` }}>
                                    {t.qrFallback}
                                </div>
                            ) : (
                                <Image
                                    src={ZELLE_QR}
                                    alt={t.qrAlt}
                                    width={192}
                                    height={192}
                                    className="w-48 h-48 object-contain"
                                    onError={() => setQrFailed(true)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Right: details */}
                    <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            <Plane size={16} style={{ color: APRICOT }} />
                            <h3 className="font-serif text-2xl font-light" style={{ color: IVORY }}>
                                {t.sendUs} <span className="italic" style={{ color: APRICOT }}>{t.sendUsItalic}</span>
                            </h3>
                        </div>

                        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,247,236,0.6)", letterSpacing: "0.15em" }}>
                            {t.zelleEmail}
                        </p>
                        <div className="flex items-center gap-2 mb-6 rounded-xl p-3" style={{ backgroundColor: "rgba(255,247,236,0.08)", border: "1px solid rgba(255,247,236,0.15)" }}>
                            <span className="text-sm break-all flex-1" style={{ color: IVORY }}>{ZELLE_EMAIL}</span>
                            <button
                                onClick={copyEmail}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all hover:opacity-90 shrink-0"
                                style={{ backgroundColor: copied ? SKY : APRICOT, color: SKY_DEEP, letterSpacing: "0.1em" }}
                                aria-label={t.copyEmail}
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? t.copied : t.copy}
                            </button>
                        </div>

                        <ol className="space-y-3">
                            {t.zelleSteps.map((step, i) => (
                                <li key={step} className="flex items-start gap-3 text-sm" style={{ color: "rgba(255,247,236,0.85)" }}>
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                                        style={{ backgroundColor: APRICOT, color: SKY_DEEP }}
                                    >
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>

                        <p className="text-xs mt-6" style={{ color: "rgba(255,247,236,0.55)" }}>
                            {t.checkEmail}
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default function RegistryPage() {
    const { lang: language } = useLanguage();
    const t = COPY[language];

    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Hero */}
            <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden" style={{ backgroundColor: SKY_DEEP }}>
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `radial-gradient(circle at 20% 40%, ${APRICOT} 0%, transparent 50%), radial-gradient(circle at 80% 60%, ${SKY} 0%, transparent 50%)` }}
                />
                <div className="relative z-10">
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="uppercase tracking-widest mb-4 flex items-center justify-center gap-2"
                        style={{ color: APRICOT, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                    >
                        <Sparkles size={12} /> {t.heroOverline}
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="heading-display"
                        style={{ color: IVORY }}
                    >
                        {t.heroTitle} <span className="italic" style={{ color: APRICOT }}>{t.heroTitleItalic}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="mt-4 text-sm max-w-md mx-auto"
                        style={{ color: "rgba(255,247,236,0.7)" }}
                    >
                        {t.heroDescription}
                    </motion.p>
                </div>
            </div>

            {/* Quote */}
            <section className="py-14 px-6 text-center" style={{ backgroundColor: IVORY }}>
                <div className="flex items-center justify-center gap-4 mb-5" aria-hidden="true">
                    <div className="h-px w-10" style={{ backgroundColor: SAND }} />
                    <Heart size={13} style={{ color: APRICOT, fill: APRICOT }} />
                    <div className="h-px w-10" style={{ backgroundColor: SAND }} />
                </div>
                <blockquote
                    className="font-serif italic text-xl md:text-2xl font-light max-w-xl mx-auto leading-relaxed"
                    style={{ color: SKY_DEEP }}
                >
                    &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm" style={{ color: `${SKY_DEEP}66` }} translate="no">— Jhoana &amp; Damariel</p>
            </section>

            {/* Honeymoon Fund — Zelle */}
            <ZelleHoneymoonFund language={language} />

            {/* Registry cards — the "stuff" registries */}
            <section className="section-pad" style={{ backgroundColor: SAND_LIGHT }}>
                <div className="container-wedding mx-auto">
                    <SectionHeader overline={t.registriesOverline} title={t.registriesTitle} titleItalic={t.registriesTitleItalic} className="mb-12" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                        {REGISTRIES.map((r, i) => (
                            <motion.a
                                key={r.store}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -6 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card-wedding group block focus-visible:outline-2 focus-visible:outline-offset-2"
                                style={{
                                    border: r.featured ? `2px solid ${r.color}` : undefined,
                                    backgroundColor: IVORY,
                                    outlineColor: SKY,
                                }}
                                aria-label={`${r.store} ${t.registryLinkLabel}`}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: r.color }}>
                                    <r.icon size={20} style={{ color: IVORY }} />
                                </div>
                                <p className="label-overline mb-1" style={{ color: `${SKY_DEEP}66` }}>{t.registryDetails[r.id].category}</p>
                                <h3 className="font-serif text-xl font-normal mb-2" style={{ color: SKY_DEEP }}>{r.store}</h3>
                                <p className="text-sm leading-relaxed mb-4" style={{ color: `${SKY_DEEP}99` }}>{t.registryDetails[r.id].description}</p>
                                <span className="flex items-center gap-1 text-xs uppercase tracking-widest transition-opacity group-hover:opacity-70" style={{ color: r.color }}>
                                    {t.viewRegistry} <ExternalLink size={11} />
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section className="section-pad" style={{ backgroundColor: IVORY }}>
                <div className="container-wedding mx-auto">
                    <SectionHeader overline={t.tipsOverline} title={t.tipsTitle} titleItalic={t.tipsTitleItalic} className="mb-10" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        {t.tips.map((tip, i) => {
                            const TipIcon = i === 0 ? Gift : i === 1 ? Send : Heart;
                            return (
                                <motion.div
                                    key={tip.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="card-wedding"
                                    style={{ backgroundColor: IVORY }}
                                >
                                    <TipIcon size={20} className="mb-3" style={{ color: APRICOT }} />
                                    <h3 className="font-serif text-lg font-normal mb-1" style={{ color: SKY_DEEP }}>{tip.title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: `${SKY_DEEP}99` }}>{tip.body}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}