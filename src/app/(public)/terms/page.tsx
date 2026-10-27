"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

const COPY_EN = {
    title: "Terms and Conditions — Causey/Cárdenas Wedding",
    effective: "Effective date: August 1st 2027",
    consent: "By providing your phone number and/or email address through this website or verbally to the couple, you agree to receive text messages (SMS/MMS/WhatsApp) related to our wedding, including save-the-date announcements, invite codes, RSVP reminders, and travel updates.",
    rates: "Message and data rates may apply. Message frequency varies (approximately 2–5 messages total). You may opt out at any time by replying STOP, or reply HELP for assistance.",
    service: "This messaging service is provided by Causey Innovations LLC on behalf of the couple and is intended solely for invited wedding guests. See our",
    privacy: "Privacy Policy",
    footer: "Causey & Cárdenas · June 13, 2027",
};

const COPY_ES: typeof COPY_EN = {
    title: "Términos y condiciones — Boda de Causey/Cárdenas",
    effective: "Fecha de entrada en vigor: 1 de agosto de 2027",
    consent: "Al proporcionar tu número de teléfono o correo electrónico en este sitio web o verbalmente a la pareja, aceptas recibir mensajes de texto (SMS/MMS/WhatsApp) relacionados con nuestra boda, incluidos avisos para reservar la fecha, códigos de invitación, recordatorios para confirmar asistencia y novedades de viaje.",
    rates: "Pueden aplicarse cargos por mensajes y datos. La frecuencia varía (aproximadamente entre 2 y 5 mensajes en total). Puedes cancelar en cualquier momento respondiendo STOP o responder HELP para obtener ayuda.",
    service: "Causey Innovations LLC proporciona este servicio de mensajería en nombre de la pareja y está destinado exclusivamente a los invitados a la boda. Consulta nuestra",
    privacy: "Política de privacidad",
    footer: "Causey y Cárdenas · 13 de junio de 2027",
};

export default function TermsPage() {
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
                {t.consent}
            </p>

            <p>
                {t.rates}
            </p>

            <p>
                {t.service}{" "}
                <a href="/privacy" style={{ color: "#8a6d3b" }}>
                    {t.privacy}
                </a>{" "}
                for details on how your information is used.
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