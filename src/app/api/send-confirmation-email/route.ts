// Place at: app/api/send-confirmation-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

type Lang = "en" | "es";
type WeddingKey = "Colombia" | "USA";

type PartyMember = {
    full_name: string;
    member_type: string;
    age: number | null;
    attending_colombia: boolean;
    attending_florida: boolean;
};

const FROM_EMAIL = "Jhoana & Damariel <SaveTheDate@causeycardenasforever.com>";
const REPLY_TO_EMAIL = "causeycardenas@gmail.com";
const INTERNAL_NOTIFY_EMAILS = ["causeycardenas@gmail.com"];
const SITE_URL = "https://causeycardenasforever.com";

// Optional: name of an SES configuration set (for delivery/bounce tracking).
// Set SES_CONFIGURATION_SET in your environment variables to turn it on.
const CONFIGURATION_SET = process.env.SES_CONFIGURATION_SET;
const configSetField = CONFIGURATION_SET ? { ConfigurationSetName: CONFIGURATION_SET } : {};

// CONFIRM: this email used to say "Pereira", but every page on the site says Manizales.
const COLOMBIA_CITY = "Manizales";

const WEDDING_LABELS: Record<Lang, Record<WeddingKey, string>> = {
    en: {
        Colombia: `Manizales, Colombia — June 12, 2027 · Hacienda Lindaraja`,
        USA: "Gainesville, Florida — April 24, 2027 · Baughman Center",
    },
    es: {
        Colombia: `Manizales, Colombia — 12 de junio de 2027 ·  Hacienda Lindaraja`,
        USA: "Gainesville, Florida — 24 de abril de 2027 · Baughman Center",
    },
};

const SHORT_LABELS: Record<WeddingKey, string> = { Colombia: "Colombia", USA: "Gainesville" };

const COPY = {
    en: {
        // Plain subject: emoji and exclamation marks are spam signals.
        subject: "Your Save the Date is confirmed",
        preheader: "Here's what we have on file for you.",
        overline: "Save the Date Confirmed",
        thanks: (n: string) => `Thank you, ${n}!`,
        intro: "We're so glad you'll be celebrating with us. Here's what we've got on file for you:",
        celebrations: "The celebrations",
        whosComing: "Who's coming",
        you: "You",
        notAttending: "Not attending",
        child: "child",
        childAge: (a: number) => `child, age ${a}`,
        nextLabel: "What happens next:",
        nextBody:
            "your official RSVP invitation (with meal choices and travel details) will follow closer to the wedding. In the meantime, you can visit our site any time to check dates, travel info, the registry, and more.",
        visit: "Visit Our Site",
        update:
            "Need to update anything — your party, contact info, or attendance? Just log back in with your invite code, or reach out to us directly and we'll take care of it.",
        spamNote:
            "Tip: if this email landed in your spam or junk folder, please mark it as “Not spam” so you receive our future updates.",
        signoff: "— Jhoana & Damariel",
    },
    es: {
        subject: "Tu fecha está confirmada",
        preheader: "Esto es lo que tenemos registrado para ti.",
        overline: "Fecha confirmada",
        thanks: (n: string) => `¡Gracias, ${n}!`,
        intro: "Nos alegra mucho que vayas a celebrar con nosotros. Esto es lo que tenemos registrado para ti:",
        celebrations: "Las celebraciones",
        whosComing: "Quiénes asistirán",
        you: "Tú",
        notAttending: "No asistirá",
        child: "niño/a",
        childAge: (a: number) => `niño/a, ${a} ${a === 1 ? "año" : "años"}`,
        nextLabel: "Qué sigue:",
        nextBody:
            "te enviaremos la invitación oficial (con la elección de platos y los detalles de viaje) cuando se acerque la boda. Mientras tanto, puedes visitar nuestro sitio cuando quieras para ver fechas, información de viaje, la lista de regalos y más.",
        visit: "Visitar nuestro sitio",
        update:
            "¿Necesitas actualizar algo, como tu grupo, tus datos de contacto o tu asistencia? Inicia sesión de nuevo con tu código de invitación o escríbenos directamente y nos encargaremos.",
        spamNote:
            "Consejo: si este correo llegó a tu carpeta de spam o correo no deseado, márcalo como “No es spam” para recibir nuestras próximas novedades.",
        signoff: "— Jhoana y Damariel",
    },
} as const;

// Names and notes come from guests, so escape them before putting them in HTML.
const esc = (value: unknown) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

function keysFor(colombia: boolean, florida: boolean): WeddingKey[] {
    // Gainesville (April) comes before Colombia (June)
    return [...(florida ? ["USA" as const] : []), ...(colombia ? ["Colombia" as const] : [])];
}

function memberLabel(lang: Lang, m: PartyMember) {
    const c = COPY[lang];
    if (m.member_type !== "child") return m.full_name;
    return `${m.full_name} (${m.age !== null && m.age !== undefined ? c.childAge(m.age) : c.child})`;
}

type EmailData = {
    firstName: string;
    primaryKeys: WeddingKey[];
    party: PartyMember[];
};

function attendanceText(lang: Lang, keys: WeddingKey[]) {
    return keys.length ? keys.map((k) => SHORT_LABELS[k]).join(" + ") : COPY[lang].notAttending;
}

function celebrationKeys(d: EmailData): WeddingKey[] {
    return keysFor(
        d.primaryKeys.includes("Colombia") || d.party.some((m) => m.attending_colombia),
        d.primaryKeys.includes("USA") || d.party.some((m) => m.attending_florida),
    );
}

// ---------- Guest email ----------

function buildGuestEmailHtml(lang: Lang, d: EmailData) {
    const c = COPY[lang];
    const weddingLines = celebrationKeys(d)
        .map((k) => `<li style="margin-bottom:6px;">${esc(WEDDING_LABELS[lang][k])}</li>`)
        .join("");

    const whoLines = [
        `<li style="margin-bottom:6px;"><strong>${esc(c.you)}:</strong> ${esc(attendanceText(lang, d.primaryKeys))}</li>`,
        ...d.party.map((m) => {
            const keys = keysFor(m.attending_colombia, m.attending_florida);
            return `<li style="margin-bottom:6px;"><strong>${esc(memberLabel(lang, m))}:</strong> ${esc(attendanceText(lang, keys))}</li>`;
        }),
    ].join("");

    // A complete HTML document (doctype, head, title, body) plus a hidden preheader.
    // Filters treat bare HTML fragments as lower quality.
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(c.subject)}</title>
</head>
<body style="margin:0; padding:16px; background-color:#FFF7EC;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(c.preheader)}</div>
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color: #123B54;">
    <div style="background-color: #123B54; background: linear-gradient(135deg, #123B54 0%, #0a2438 100%); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
      <p style="color: #FFB482; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px;">${esc(c.overline)}</p>
      <h1 style="color: #FFF7EC; font-weight: 300; font-size: 28px; margin: 0;">${esc(c.thanks(d.firstName))}</h1>
    </div>
    <div style="background: #FFF7EC; padding: 28px; border-radius: 0 0 16px 16px;">
      <p style="font-size: 14px; line-height: 1.6;">${esc(c.intro)}</p>
      <p style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #123B5499; margin: 18px 0 6px;">${esc(c.celebrations)}</p>
      <ul style="font-size: 14px; line-height: 1.6; padding-left: 18px; margin-top: 0;">${weddingLines}</ul>
      <p style="font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #123B5499; margin: 18px 0 6px;">${esc(c.whosComing)}</p>
      <ul style="font-size: 14px; line-height: 1.6; padding-left: 18px; margin-top: 0;">${whoLines}</ul>
      <p style="font-size: 14px; line-height: 1.6;">
        <strong>${esc(c.nextLabel)}</strong> ${esc(c.nextBody)}
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${SITE_URL}" style="background: #FFB482; color: #123B54; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
          ${esc(c.visit)}
        </a>
      </div>
      <p style="font-size: 12px; color: #123B5499; line-height: 1.6;">${esc(c.update)}</p>
      <p style="font-size: 12px; color: #123B5499; line-height: 1.6;">${esc(c.spamNote)}</p>
      <p style="font-size: 13px; font-style: italic; color: #FFB482; margin-top: 20px;">${esc(c.signoff)}</p>
    </div>
  </div>
</body>
</html>`;
}

function buildGuestEmailText(lang: Lang, d: EmailData) {
    const c = COPY[lang];
    const weddingLines = celebrationKeys(d).map((k) => `- ${WEDDING_LABELS[lang][k]}`).join("\n");
    const whoLines = [
        `- ${c.you}: ${attendanceText(lang, d.primaryKeys)}`,
        ...d.party.map((m) => `- ${memberLabel(lang, m)}: ${attendanceText(lang, keysFor(m.attending_colombia, m.attending_florida))}`),
    ].join("\n");

    return `${c.thanks(d.firstName)}

${c.intro}

${c.celebrations}:
${weddingLines}

${c.whosComing}:
${whoLines}

${c.nextLabel} ${c.nextBody}

${SITE_URL}

${c.update}

${c.spamNote}

${c.signoff}`;
}

// ---------- Internal notification (always English) ----------

type InternalData = {
    firstName: string;
    lastName?: string;
    guestId: string;
    email?: string;
    phone?: string;
    language: Lang;
    primaryKeys: WeddingKey[];
    party: PartyMember[];
    anyoneAttending: boolean;
    guestCount: number;
    colombiaTotal: number;
    floridaTotal: number;
    mailingAddress?: string;
    smsConsent: boolean;
    declineNote?: string;
    bridal: boolean;
};

function partyLinesEn(d: InternalData) {
    return d.party.map((m) => {
        const kind = m.member_type === "child" ? `child${m.age !== null && m.age !== undefined ? `, ${m.age}` : ""}` : "adult";
        const keys = keysFor(m.attending_colombia, m.attending_florida);
        return `${m.full_name} (${kind}) — ${attendanceText("en", keys)}`;
    });
}

function buildInternalEmailHtml(d: InternalData) {
    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:6px 12px 6px 0; font-size:12px; color:#123B5499; white-space:nowrap; vertical-align:top;">${esc(label)}</td>
        <td style="padding:6px 0; font-size:13px; color:#123B54;">${value}</td>
      </tr>`;

    const youText = attendanceText("en", d.primaryKeys);
    const partyHtml = partyLinesEn(d).map(esc).join("<br/>");

    return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; color: #123B54;">
      <div style="background: ${d.anyoneAttending ? "#123B54" : "#8a9aa5"}; padding: 20px 24px; border-radius: 14px 14px 0 0;">
        <p style="color:#fff; font-size:15px; margin:0;">
          ${d.anyoneAttending ? "🎉 New RSVP: attending" : "🌸 New RSVP: declined"}
          ${d.bridal ? " (Bridal Party)" : ""}
        </p>
      </div>
      <div style="background:#FFF7EC; padding:20px 24px; border-radius:0 0 14px 14px;">
        <table style="border-collapse:collapse; width:100%;">
          ${row("Guest", esc(`${d.firstName} ${d.lastName ?? ""}`.trim()))}
          ${row("Guest ID", esc(d.guestId))}
          ${row("Invitee", esc(youText))}
          ${d.anyoneAttending ? row("Total attending", String(d.guestCount)) : ""}
          ${d.anyoneAttending ? row("Colombia / Gainesville", `${d.colombiaTotal} / ${d.floridaTotal}`) : ""}
          ${d.party.length ? row("Party", partyHtml) : ""}
          ${row("Language", d.language === "es" ? "Spanish" : "English")}
          ${row("Email", esc(d.email ?? "—"))}
          ${row("Phone", esc(d.phone ?? "—"))}
          ${d.anyoneAttending ? row("SMS consent", d.smsConsent ? "Yes" : "No") : ""}
          ${d.mailingAddress ? row("Mailing address", esc(d.mailingAddress)) : ""}
          ${d.declineNote ? row("Note", esc(d.declineNote)) : ""}
        </table>
      </div>
    </div>
  `;
}

function buildInternalEmailText(d: InternalData) {
    return `${d.anyoneAttending ? "New RSVP: attending" : "New RSVP: declined"}${d.bridal ? " (Bridal Party)" : ""}

Guest: ${d.firstName} ${d.lastName ?? ""}
Guest ID: ${d.guestId}
Invitee: ${attendanceText("en", d.primaryKeys)}
${d.anyoneAttending ? `Total attending: ${d.guestCount}\nColombia / Gainesville: ${d.colombiaTotal} / ${d.floridaTotal}\n` : ""}${d.party.length ? `Party:\n${partyLinesEn(d).map((l) => `  - ${l}`).join("\n")}\n` : ""}Language: ${d.language === "es" ? "Spanish" : "English"}
Email: ${d.email ?? "—"}
Phone: ${d.phone ?? "—"}
${d.anyoneAttending ? `SMS consent: ${d.smsConsent ? "Yes" : "No"}\n` : ""}${d.mailingAddress ? `Mailing address: ${d.mailingAddress}\n` : ""}${d.declineNote ? `Note: ${d.declineNote}\n` : ""}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { guestId, language, skipInternalNotification } = body;

        if (!guestId) {
            return NextResponse.json({ error: "guestId is required" }, { status: 400 });
        }

        // Everything in the email comes from the database, not from the request body.
        // That way this endpoint can only ever email the address a guest saved for
        // themselves — it can't be used to send arbitrary mail to arbitrary people.
        const supabase = createAdminClient();

        const { data: guest, error: guestErr } = await supabase
            .from("guests")
            .select("id, first_name, last_name, email, phone, std_attending_colombia, std_attending_florida, guest_count, mailing_address, sms_consent, decline_reason, role, invitation_type, spanish")
            .eq("id", guestId)
            .maybeSingle();
        if (guestErr) {
            console.error("Failed to look up guest for confirmation email:", guestErr);
            return NextResponse.json({ error: "Unable to look up guest" }, { status: 500 });
        }
        if (!guest) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        const { data: partyRows, error: partyErr } = await supabase
            .from("guest_plus_ones")
            .select("full_name, member_type, age, attending_colombia, attending_florida")
            .eq("guest_id", guestId)
            .order("created_at", { ascending: true });
        if (partyErr) throw new Error(partyErr.message);

        const party = (partyRows ?? []) as PartyMember[];
        const lang: Lang = language === "es" || language === "en" ? language : guest.spanish ? "es" : "en";

        const primaryKeys = keysFor(!!guest.std_attending_colombia, !!guest.std_attending_florida);
        const attendingMembers = party.filter((m) => m.attending_colombia || m.attending_florida);
        const anyoneAttending = primaryKeys.length > 0 || attendingMembers.length > 0;

        const colombiaTotal = (primaryKeys.includes("Colombia") ? 1 : 0) + party.filter((m) => m.attending_colombia).length;
        const floridaTotal = (primaryKeys.includes("USA") ? 1 : 0) + party.filter((m) => m.attending_florida).length;

        // Support both custom SES_ prefix and standard AWS_ prefix
        const accessKeyId = process.env.SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-2";

        if (!accessKeyId || !secretAccessKey) {
            console.error("SES Credentials Missing! Check your environment variables.");
            return NextResponse.json({ error: "SES Credentials missing on server" }, { status: 500 });
        }

        const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");
        const ses = new SESClient({ region, credentials: { accessKeyId, secretAccessKey } });

        const name = guest.first_name || (lang === "es" ? "invitado" : "there");
        const guestEmail = typeof guest.email === "string" ? guest.email.trim() : "";
        const results: Record<string, unknown> = {};
        let guestEmailSent = !anyoneAttending;

        // 1. Guest confirmation (sent when anyone on the invitation is attending)
        if (anyoneAttending && !guestEmail) {
            results.guestEmail = { success: false, error: "No email address on file" };
        } else if (anyoneAttending) {
            const data: EmailData = { firstName: name, primaryKeys, party };
            const guestCommand = new SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: { ToAddresses: [guestEmail] },
                ReplyToAddresses: [REPLY_TO_EMAIL],
                ...configSetField,
                Message: {
                    Subject: { Data: COPY[lang].subject, Charset: "UTF-8" },
                    Body: {
                        Html: { Data: buildGuestEmailHtml(lang, data), Charset: "UTF-8" },
                        Text: { Data: buildGuestEmailText(lang, data), Charset: "UTF-8" },
                    },
                },
            });

            try {
                const r = await ses.send(guestCommand);
                guestEmailSent = true;
                results.guestEmail = { success: true, messageId: r.MessageId, language: lang };
                console.log("SES accepted guest email:", r.MessageId);

                const { data: updatedGuest, error: trackingError } = await supabase
                    .from("guests")
                    .update({
                        confirmation_email_sent: true,
                        confirmation_email_sent_at: new Date().toISOString(),
                    })
                    .eq("id", guestId)
                    .select("id")
                    .single();

                if (trackingError || !updatedGuest) {
                    console.error("Failed to mark confirmation_email_sent in DB:", trackingError);
                    results.deliveryTracking = {
                        success: false,
                        error: "Email was accepted by the provider but its delivery status could not be recorded.",
                    };
                } else {
                    results.deliveryTracking = { success: true };
                }
            } catch (err: any) {
                console.error("AWS SES Guest Email Error:", err?.message || err);
                results.guestEmail = { success: false, error: err?.message || "SES send error" };
            }
        } else {
            results.guestEmail = { success: true, skipped: true, reason: "Nobody attending" };
        }

        // 2. Internal notification (to you, in English)
        if (!skipInternalNotification) {
            const internal: InternalData = {
                firstName: name,
                lastName: guest.last_name ?? undefined,
                guestId,
                email: guestEmail || undefined,
                phone: typeof guest.phone === "string" ? guest.phone.trim() : undefined,
                language: lang,
                primaryKeys,
                party,
                anyoneAttending,
                guestCount: guest.guest_count ?? 0,
                colombiaTotal,
                floridaTotal,
                mailingAddress: typeof guest.mailing_address === "string" && guest.mailing_address.trim() ? guest.mailing_address.trim() : undefined,
                smsConsent: !!guest.sms_consent,
                declineNote: typeof guest.decline_reason === "string" && guest.decline_reason.trim() ? guest.decline_reason.trim() : undefined,
                bridal: guest.role === "bridal_party" || guest.invitation_type === "bridal_party",
            };

            const summary = anyoneAttending
                ? `${guest.guest_count ?? attendingMembers.length} attending · Colombia ${colombiaTotal} / Gainesville ${floridaTotal}`
                : "declined";

            const internalCommand = new SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: { ToAddresses: INTERNAL_NOTIFY_EMAILS },
                ReplyToAddresses: [REPLY_TO_EMAIL],
                ...configSetField,
                Message: {
                    Subject: { Data: `${anyoneAttending ? "✅" : "🌸"} ${name} just RSVP'd — ${summary}`, Charset: "UTF-8" },
                    Body: {
                        Html: { Data: buildInternalEmailHtml(internal), Charset: "UTF-8" },
                        Text: { Data: buildInternalEmailText(internal), Charset: "UTF-8" },
                    },
                },
            });

            try {
                const r = await ses.send(internalCommand);
                results.internalEmail = { success: true, messageId: r.MessageId };
                console.log("SES accepted internal notification:", r.MessageId);
            } catch (err: any) {
                console.error("AWS SES Internal Email Error:", err?.message || err);
                results.internalEmail = { success: false, error: err?.message || "SES internal email error" };
            }
        } else {
            results.internalEmail = { skipped: true };
        }

        if (!guestEmailSent) {
            return NextResponse.json(
                { success: false, error: "Confirmation email could not be sent.", ...results },
                { status: 502 },
            );
        }

        return NextResponse.json({ success: true, ...results });
    } catch (err: any) {
        console.error("Fatal /api/send-confirmation-email error:", err);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}