"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { useLanguage } from "@/components/providers/LanguageProvider";

const SAVE_THE_DATE_PHOTOS = [
  { src: "/forehead.jpeg",   alt: "Happy together", width: 1600, height: 1067 },
  { src: "/ringsholder.jpeg", alt: "The ring",       width: 1200, height: 1600},
    {src: "/9EDC617C-7DBA-4505-AE01-B72F8C181668.jpeg", alt: "The ring", width: 1200, height: 1600},
     {src: "/82C28E49-CAA3-47DC-93EF-46B6660BBA17.jpeg", alt: "The ring", width: 1200, height: 1600},
    {src: "/387533C2-EAA4-4695-922D-23E16F5880D2.jpeg", alt: "The ring", width: 1200, height: 1600},
    {src: "/49584828-546A-4E08-B86A-47B775B1D687.jpeg", alt: "The ring", width: 1200, height: 1600},
    {src: "/A58E6921-7AF0-4BA2-96D5-423D1E9C75D7.jpeg", alt: "The ring", width: 1200, height: 1600},
];
// Palette — Sky Blue + Apricot + Ivory + Sand
const NAVY = "#2c3e4a";
const IVORY = "#FFF7EC";
const SAND = "#E6D2B3";
const APRICOT = "#FFB482";

const MOMENTS = [
    {
        year: "2023",
        title: "A Simple Swipe",
        body: "It all started with a match on Hinge in August 2023. Neither of us expected a dating app to lead us to the love of our lives — but the connection was undeniable from the very first conversation.",
    },
    {
        year: "2023",
        title: "Loaded Fries & Fast Five",
        body: "Our first date was at Flippin' Fries Factory in The Krates. Damariel was so nervous he barely ate — until one question changed everything: \"What's your favorite movie?\" Jhoana's answer, Fast & Furious 7, sealed the deal. That lunch turned into an entire day together.",
    },
    {
        year: "2024",
        title: "Growing Together",
        body: "We celebrated life's victories and supported each other through every challenge — Damariel finishing college, Jhoana preparing for medical school. We learned the best relationships are built on friendship, trust, teamwork, and faith.",
    },
    {
        year: "Feb 2025",
        title: "A New Chapter in Texas",
        body: "When Damariel had the opportunity to start his career in Texas, only one opinion mattered — Jhoana's. Her answer confirmed what he already knew: they were building a future together, and she moved to Texas with him.",
    },
    {
        year: "May 2026",
        title: "The Proposal",
        body: "After weeks of planning — finding the perfect ring, asking for her family's blessing, and secretly coordinating a photographer — Damariel took Jhoana to the Dallas Arboretum and Botanical Garden. Surrounded by blooming gardens, he got down on one knee. She said yes.",
    },
    {
        year: "2027",
        title: "Celebration Time",
        body: "Now, with grateful hearts and surrounded by the love of family and friends, we're beginning our greatest adventure yet.",
    },
];

type StoryMoment = { year: string; title: string; body: string };
type StoryCopy = {
    photosAlt: string[];
    heroOverline: string;
    heroTitle: string;
    heroItalic: string;
    timelineOverline: string;
    timelineTitle: string;
    timelineItalic: string;
    moments: StoryMoment[];
    narrativeOverline: string;
    narrativeTitle: string;
    narrativeItalic: string;
    paragraphs: string[];
    stats: string[];
};

const COPY_EN: StoryCopy = {
    photosAlt: ["Happy together", "The ring", "Engagement photo", "The ring", "Engagement photo", "Engagement photo", "Engagement photo"],
    heroOverline: "Our Journey",
    heroTitle: "The Story",
    heroItalic: "So Far",
    timelineOverline: "Chapter by Chapter",
    timelineTitle: "How We",
    timelineItalic: "Got Here",
    moments: MOMENTS,
    narrativeOverline: "In Their Own Words",
    narrativeTitle: "The Full",
    narrativeItalic: "Story",
    paragraphs: [
        "It all started with a simple swipe on Hinge.",
        "Neither of us expected that trying out a dating app would lead to finding the love of our lives. After matching, we spent a few days getting to know each other through the app. Little did Damariel know that Jhoana was recovering in bed from an injury during those first conversations. Even so, the connection was undeniable.",
        "Before long, we exchanged phone numbers and our conversations became even more frequent. It didn't take long before we decided to meet in person.",
        "Our first date was at Flippin' Fries Factory in The Krates. We shared a basket of loaded fries, and Damariel was so nervous he barely ate. As the conversation flowed, one simple question changed everything: \"What's your favorite movie?\"",
        "When Jhoana answered Fast & Furious 7, Damariel couldn't believe it. As a huge Fast & Furious fan himself, he instantly knew they had something special in common. That lunch date quickly turned into an entire day together, talking, laughing, and getting to know one another.",
        "Over the next year, our relationship continued to grow. We celebrated life's victories together and supported each other through every challenge. Damariel completed college while Jhoana prepared for the next step in her journey toward medical school. Through it all, we became each other's biggest supporters, learning that the best relationships are built on friendship, trust, teamwork, and faith.",
        "When Damariel received an opportunity to begin his career in Texas, there was only one opinion that truly mattered — Jhoana's. Before making the decision, he asked how she felt about starting this new chapter together and whether she would be willing to make the move. Her answer confirmed what he already knew: they were building a future together.",
        "As their love continued to grow, Damariel knew it was time to ask the most important question of his life.",
        "After weeks of planning, finding the perfect ring, asking for her family's blessing, and secretly coordinating with a photographer, he invited Jhoana on what seemed like an ordinary date to the Dallas Arboretum and Botanical Garden.",
        "Surrounded by beautiful gardens and blooming flowers, Damariel got down on one knee and asked Jhoana to spend forever with him. She said yes.",
        "Now, with grateful hearts and surrounded by the love of our family and friends, we're excited to begin our greatest adventure yet — together.",
    ],
    stats: ["Weddings", "Countries", "Love"],
};

const COPY_ES: typeof COPY_EN = {
    photosAlt: ["Felices juntos", "El anillo", "Foto de compromiso", "El anillo", "Foto de compromiso", "Foto de compromiso", "Foto de compromiso"],
    heroOverline: "Nuestro camino",
    heroTitle: "Nuestra historia",
    heroItalic: "hasta hoy",
    timelineOverline: "Capítulo por capítulo",
    timelineTitle: "Cómo",
    timelineItalic: "llegamos aquí",
    moments: [
        { year: "2023", title: "Un simple desliz", body: "Todo comenzó con un match en Hinge en agosto de 2023. Ninguno imaginó que una aplicación de citas nos llevaría al amor de nuestras vidas, pero la conexión fue innegable desde la primera conversación." },
        { year: "2023", title: "Papas cargadas y Rápidos y Furiosos", body: "Nuestra primera cita fue en Flippin' Fries Factory, en The Krates. Damariel estaba tan nervioso que casi no comió, hasta que una pregunta lo cambió todo: «¿Cuál es tu película favorita?». La respuesta de Jhoana, Rápidos y Furiosos 7, selló el momento. Ese almuerzo se convirtió en un día entero juntos." },
        { year: "2024", title: "Creciendo juntos", body: "Celebramos los logros de la vida y nos apoyamos en cada desafío: Damariel terminó la universidad mientras Jhoana se preparaba para estudiar medicina. Aprendimos que las mejores relaciones se construyen con amistad, confianza, trabajo en equipo y fe." },
        { year: "Feb. 2025", title: "Un nuevo capítulo en Texas", body: "Cuando Damariel tuvo la oportunidad de comenzar su carrera en Texas, solo importaba una opinión: la de Jhoana. Su respuesta confirmó lo que él ya sabía: estaban construyendo un futuro juntos, y ella se mudó a Texas con él." },
        { year: "Mayo de 2026", title: "La propuesta", body: "Después de semanas de preparativos —encontrar el anillo perfecto, pedir la bendición de su familia y coordinar en secreto a un fotógrafo— Damariel llevó a Jhoana al Dallas Arboretum and Botanical Garden. Rodeado de jardines florecidos, se arrodilló. Ella dijo que sí." },
        { year: "2027", title: "¡A celebrar!", body: "Ahora, con el corazón agradecido y rodeados del cariño de nuestra familia y amistades, comenzamos nuestra mayor aventura hasta ahora." },
    ],
    narrativeOverline: "En nuestras propias palabras",
    narrativeTitle: "La historia",
    narrativeItalic: "completa",
    paragraphs: [
        "Todo comenzó con un simple desliz en Hinge.",
        "Ninguno imaginó que probar una aplicación de citas nos llevaría a encontrar al amor de nuestras vidas. Después de hacer match, pasamos unos días conociéndonos por la aplicación. Damariel no sabía que Jhoana se estaba recuperando de una lesión durante esas primeras conversaciones. Aun así, la conexión fue innegable.",
        "Pronto intercambiamos números de teléfono y nuestras conversaciones se hicieron más frecuentes. No tardamos en decidir que queríamos conocernos en persona.",
        "Nuestra primera cita fue en Flippin' Fries Factory, en The Krates. Compartimos una canasta de papas cargadas y Damariel estaba tan nervioso que casi no comió. En medio de la conversación, una pregunta sencilla lo cambió todo: «¿Cuál es tu película favorita?».",
        "Cuando Jhoana respondió Rápidos y Furiosos 7, Damariel no lo podía creer. Como gran fan de la saga, supo enseguida que tenían algo especial en común. Ese almuerzo se convirtió en un día entero juntos, conversando, riendo y conociéndose.",
        "Durante el año siguiente, nuestra relación siguió creciendo. Celebramos juntos los logros y nos apoyamos en cada desafío. Damariel terminó la universidad mientras Jhoana se preparaba para dar el siguiente paso hacia la carrera de medicina. Nos convertimos en el mayor apoyo del otro y aprendimos que las mejores relaciones se construyen con amistad, confianza, trabajo en equipo y fe.",
        "Cuando Damariel recibió la oportunidad de comenzar su carrera en Texas, solo había una opinión que realmente importaba: la de Jhoana. Antes de decidir, le preguntó cómo se sentía con la idea de comenzar ese nuevo capítulo juntos y mudarse. Su respuesta confirmó lo que él ya sabía: estaban construyendo un futuro juntos.",
        "A medida que su amor crecía, Damariel supo que era hora de hacer la pregunta más importante de su vida.",
        "Después de semanas de preparativos, de encontrar el anillo perfecto, pedir la bendición de la familia de Jhoana y coordinar en secreto a un fotógrafo, la invitó a una cita que parecía común en el Dallas Arboretum and Botanical Garden.",
        "Rodeado de hermosos jardines y flores, Damariel se arrodilló y le pidió a Jhoana compartir la vida juntos. Ella dijo que sí.",
        "Ahora, con el corazón agradecido y rodeados del cariño de nuestra familia y amistades, nos emociona comenzar juntos nuestra mayor aventura.",
    ],
    stats: ["Bodas", "Países", "Amor"],
};

export default function OurStoryPage() {
    const { lang } = useLanguage();
    const copy = lang === "es" ? COPY_ES : COPY_EN;
    return (
        <div style={{ backgroundColor: IVORY }}>
            {/* Page hero */}
            <div className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: NAVY }}>
                <p className="label-overline mb-4" style={{ color: APRICOT }}>{copy.heroOverline}</p>
                <h1 className="heading-display" style={{ color: IVORY }}>
                    {copy.heroTitle}{" "}
                    <span className="italic" style={{ color: APRICOT }}>{copy.heroItalic}</span>
                </h1>
            </div>

            {/* Engagement photos grid */}
            <section className="section-pad container-wedding mx-auto">
               <div className="mb-20">
    <PhotoCarousel slides={SAVE_THE_DATE_PHOTOS.map((photo, i) => ({ ...photo, alt: copy.photosAlt[i] ?? photo.alt }))} />
  </div>

                {/* Timeline */}
                <SectionHeader overline={copy.timelineOverline} title={copy.timelineTitle} titleItalic={copy.timelineItalic} className="mb-16" />

                <div className="max-w-2xl mx-auto relative">
                    <div className="absolute left-6 top-0 bottom-0 w-px" style={{ backgroundColor: `${SAND}` , opacity: 0.6 }} aria-hidden="true" />
                    {copy.moments.map((moment, i) => (
                        <div key={i} className="relative flex gap-8 mb-12">
                            <div className="flex-shrink-0 z-10">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: NAVY }}>
                                    <span className="font-serif text-[0.65rem] text-center leading-tight px-1" style={{ color: IVORY }}>{moment.year}</span>
                                </div>
                            </div>
                            <div className="flex-1 pb-4">
                                <h3 className="font-serif text-xl font-normal mb-2" style={{ color: NAVY }}>{moment.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: NAVY, opacity: 0.65 }}>{moment.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Full narrative */}
                <div className="max-w-2xl mx-auto mt-4 mb-20">
                    <SectionHeader overline={copy.narrativeOverline} title={copy.narrativeTitle} titleItalic={copy.narrativeItalic} className="mb-12" />

                    <div className="space-y-6 text-sm leading-relaxed" style={{ color: NAVY, opacity: 0.75 }}>
                        {copy.paragraphs.map((paragraph, i) => (
                            <p key={i} translate={lang === "es" ? "no" : undefined}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
                    {[
                        { value: "2", label: copy.stats[0] },
                        { value: "2", label: copy.stats[1] },
                        { value: "∞", label: copy.stats[2] },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="font-serif text-4xl font-light" style={{ color: APRICOT }}>{s.value}</p>
                            <p className="label-overline mt-1" style={{ color: NAVY, opacity: 0.4 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}