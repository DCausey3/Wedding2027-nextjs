"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

const COPY_EN = {
    title: "Privacy Policy — Causey/Cárdenas Wedding",
    effective: "Effective date: August 1, 2027",
    intro: "This website (causeycardenasforever.com) is operated by Causey Innovations LLC on behalf of the couple for the purpose of wedding planning and guest communication.",
    collectHeading: "Information We Collect",
    collect: "We collect the name, phone number, and email address (if provided) of invited guests for the purpose of sending wedding-related updates, including save-the-date announcements, RSVP confirmations, and travel information.",
    useHeading: "How We Use Your Information",
    use: "Your phone number is used solely to send text messages (SMS/MMS/WhatsApp) related to our wedding, including save-the-date notices, invite codes, RSVP reminders, and travel details. Your email, if provided, is used to send additional travel and event information as it becomes available.",
    frequencyHeading: "Message Frequency",
    frequency: "Guests can expect to receive occasional messages (approximately 2–5 total) related to save-the-date announcements, RSVP status, and wedding updates. Message and data rates may apply.",
    sharingHeading: "Non-Sharing of Information",
    sharing: "We do not sell, rent, or share your phone number or personal information with third parties for marketing purposes. Your information is used exclusively for wedding-related communication from the couple.",
    optOutHeading: "Opt-Out",
    optOut: "You may opt out of text messages at any time by replying STOP. Reply HELP for help.",
    contactHeading: "Contact",
    contact: "Questions about this policy can be directed to",
    footer: "Causey & Cárdenas · June 13, 2027",
};

const COPY_ES: typeof COPY_EN = {
    title: "Política de privacidad — Boda de Causey/Cárdenas",
    effective: "Fecha de entrada en vigor: 1 de agosto de 2027",
    intro: "Causey Innovations LLC administra este sitio web (causeycardenasforever.com) en nombre de la pareja para planificar la boda y comunicarse con los invitados.",
    collectHeading: "Información que recopilamos",
    collect: "Recopilamos el nombre, número de teléfono y correo electrónico (si se proporciona) de los invitados para enviar novedades relacionadas con la boda, incluidos avisos para reservar la fecha, confirmaciones de asistencia e información de viaje.",
    useHeading: "Cómo usamos tu información",
    use: "Usamos tu número de teléfono exclusivamente para enviar mensajes de texto (SMS/MMS/WhatsApp) relacionados con nuestra boda, incluidos avisos para reservar la fecha, códigos de invitación, recordatorios para confirmar asistencia y detalles de viaje. Si proporcionas tu correo electrónico, lo usaremos para enviarte más información de viaje y del evento cuando esté disponible.",
    frequencyHeading: "Frecuencia de los mensajes",
    frequency: "Los invitados pueden esperar recibir mensajes ocasionales (aproximadamente entre 2 y 5 en total) sobre avisos para reservar la fecha, el estado de su confirmación y novedades de la boda. Pueden aplicarse cargos por mensajes y datos.",
    sharingHeading: "No compartimos tu información",
    sharing: "No vendemos, alquilamos ni compartimos tu número de teléfono ni tu información personal con terceros para fines de marketing. La pareja usa tu información exclusivamente para comunicarse sobre la boda.",
    optOutHeading: "Cómo dejar de recibir mensajes",
    optOut: "Puedes dejar de recibir mensajes de texto en cualquier momento respondiendo STOP. Responde HELP para obtener ayuda.",
    contactHeading: "Contacto",
    contact: "Si tienes preguntas sobre esta política, puedes escribir a",
    footer: "Causey y Cárdenas · 13 de junio de 2027",
};

export default function PrivacyPolicyPage() {
    const { lang } = useLanguage();
    const t = lang === "es" ? COPY_ES : COPY_EN;
    return (
        <main
            style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                maxWidth: "720px",
                margin: "60px auto",
                padding: "0 20px",
                lineHeight: 1.7,
                color: "#2b2b2b",
                background: "#fffdf8",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.2em", color: "#5b4636" }}>
                {t.title}
            </h1>
            <p style={{ fontStyle: "italic", color: "#777", marginBottom: "2em" }}>
                {t.effective}
            </p>

            <p>
                {t.intro}
            </p>

            <SectionHeading>{t.collectHeading}</SectionHeading>
            <p>{t.collect}</p>

            <SectionHeading>{t.useHeading}</SectionHeading>
            <p>{t.use}</p>

            <SectionHeading>{t.frequencyHeading}</SectionHeading>
            <p>{t.frequency}</p>

            <SectionHeading>{t.sharingHeading}</SectionHeading>
            <p>{t.sharing}</p>

            <SectionHeading>{t.optOutHeading}</SectionHeading>
            <p>{t.optOut}</p>

            <SectionHeading>{t.contactHeading}</SectionHeading>
            <p>
                {t.contact}{" "}
                <a href="mailto:[your email]" style={{ color: "#8a6d3b" }}>
                   d.causey@causeyinnovations.com
                </a>
                .
            </p>

            <footer
                style={{
                    marginTop: "3em",
                    fontSize: "0.9rem",
                    color: "#999",
                    textAlign: "center",
                }}
            >
                {t.footer}
            </footer>
        </main>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2
            style={{
                fontSize: "1.15rem",
                marginTop: "2em",
                color: "#5b4636",
                borderBottom: "1px solid #e4dcc8",
                paddingBottom: "4px",
            }}
        >
            {children}
        </h2>
    );
}