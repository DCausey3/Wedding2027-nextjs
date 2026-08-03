import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const FROM_EMAIL = "Jhoana & Damariel <SaveTheDate@causeycardenasforever.com>";
const REPLY_TO_EMAIL = "causeycardenas@gmail.com";
const INTERNAL_NOTIFY_EMAILS = ["causeycardenas@gmail.com"];
const SITE_URL = "https://causeycardenasforever.com";

const WEDDING_LABELS: Record<string, string> = {
    Colombia: "Colombia — June 12, 2027 · Pereira",
    USA: "Gainesville — April 24, 2027 · Baughman Center",
};

// ---------- Guest Email Templates ----------

function buildGuestEmailHtml(firstName: string, attendingWeddings: string[]) {
    const weddingLines = attendingWeddings
        .map((key) => WEDDING_LABELS[key])
        .filter(Boolean)
        .map((line) => `<li style="margin-bottom:6px;">${line}</li>`)
        .join("");

    return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color: #123B54;">
      <div style="background: linear-gradient(135deg, #123B54 0%, #0a2438 100%); padding: 32px 28px; border-radius: 16px 16px 0 0; text-align: center;">
        <p style="color: #FFB482; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 12px;">Save the Date Confirmed</p>
        <h1 style="color: #FFF7EC; font-weight: 300; font-size: 28px; margin: 0;">Thank you, ${firstName}!</h1>
      </div>
      <div style="background: #FFF7EC; padding: 28px; border-radius: 0 0 16px 16px;">
        <p style="font-size: 14px; line-height: 1.6;">
          We're so glad you'll be celebrating with us. Here's what we've got on file for you:
        </p>
        <ul style="font-size: 14px; line-height: 1.6; padding-left: 18px;">
          ${weddingLines}
        </ul>
        <p style="font-size: 14px; line-height: 1.6;">
          <strong>What happens next:</strong> your official RSVP invitation (with meal choices, plus-one
          confirmation, and travel details) will follow closer to the wedding. In the meantime, you can visit
          our site any time to check dates, travel info, the registry, and more.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${SITE_URL}/login" style="background: #FFB482; color: #123B54; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; display: inline-block;">
            Visit Our Site
          </a>
        </div>
        <p style="font-size: 12px; color: #123B5499; line-height: 1.6;">
          Need to update anything — your headcount, contact info, or attendance? Just log back in with your
          invite code, or reach out to us directly and we'll take care of it.
        </p>
        <p style="font-size: 13px; font-style: italic; color: #FFB482; margin-top: 20px;">— Jhoana &amp; Damariel</p>
      </div>
    </div>
  `;
}

function buildGuestEmailText(firstName: string, attendingWeddings: string[]) {
    const weddingLines = attendingWeddings
        .map((key) => WEDDING_LABELS[key])
        .filter(Boolean)
        .map((line) => `- ${line}`)
        .join("\n");

    return `Thank you, ${firstName}!

We're so glad you'll be celebrating with us. Here's what we've got on file for you:

${weddingLines}

What happens next: your official RSVP invitation (with meal choices, plus-one confirmation, and travel details) will follow closer to the wedding. In the meantime, you can visit our site any time to check dates, travel info, the registry, and more.

${SITE_URL}/login

Need to update anything — your headcount, contact info, or attendance? Just log back in with your invite code, or reach out to us directly and we'll take care of it.

— Jhoana & Damariel`;
}

// ---------- Internal Email Templates ----------

function buildInternalEmailHtml(data: any) {
    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:6px 12px 6px 0; font-size:12px; color:#123B5499; white-space:nowrap; vertical-align:top;">${label}</td>
        <td style="padding:6px 0; font-size:13px; color:#123B54;">${value}</td>
      </tr>`;

    const weddingSummary = data.attending
        ? data.attendingWeddings.map((k: string) => WEDDING_LABELS[k] ?? k).join(" + ") || "—"
        : "Declined";

    return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; color: #123B54;">
      <div style="background: ${data.attending ? "#123B54" : "#8a9aa5"}; padding: 20px 24px; border-radius: 14px 14px 0 0;">
        <p style="color:#fff; font-size:15px; margin:0;">
          ${data.attending ? "🎉 New RSVP: attending" : "🌸 New RSVP: declined"}
          ${data.bridal ? " (Bridal Party)" : ""}
        </p>
      </div>
      <div style="background:#FFF7EC; padding:20px 24px; border-radius:0 0 14px 14px;">
        <table style="border-collapse:collapse; width:100%;">
          ${row("Guest", `${data.firstName} ${data.lastName ?? ""}`.trim())}
          ${row("Guest ID", data.guestId)}
          ${row("Attending", weddingSummary)}
          ${data.attending ? row("Headcount", String(data.headcount)) : ""}
          ${row("Email", data.email ?? "—")}
          ${row("Phone", data.phone ?? "—")}
          ${data.attending ? row("SMS consent", data.smsConsent ? "Yes" : "No") : ""}
          ${data.mailingAddress ? row("Mailing address", data.mailingAddress) : ""}
          ${data.declineNote ? row("Note", data.declineNote) : ""}
        </table>
      </div>
    </div>
  `;
}

function buildInternalEmailText(data: any) {
    const weddingSummary = data.attending
        ? data.attendingWeddings.map((k: string) => WEDDING_LABELS[k] ?? k).join(" + ") || "—"
        : "Declined";

    return `${data.attending ? "New RSVP: attending" : "New RSVP: declined"}${data.bridal ? " (Bridal Party)" : ""}

Guest: ${data.firstName} ${data.lastName ?? ""}
Guest ID: ${data.guestId}
Attending: ${weddingSummary}
${data.attending ? `Headcount: ${data.headcount}\n` : ""}Email: ${data.email ?? "—"}
Phone: ${data.phone ?? "—"}
${data.attending ? `SMS consent: ${data.smsConsent ? "Yes" : "No"}\n` : ""}${data.mailingAddress ? `Mailing address: ${data.mailingAddress}\n` : ""}${data.declineNote ? `Note: ${data.declineNote}\n` : ""}`;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            guestId,
            firstName,
            lastName,
            email,
            phone,
            attending,
            attendingWeddings,
            headcount,
            mailingAddress,
            smsConsent,
            declineNote,
            bridal,
            skipInternalNotification,
        } = body;

        if (!guestId || typeof attending !== "boolean") {
            return NextResponse.json({ error: "guestId and attending are required" }, { status: 400 });
        }

        // Support both custom SES_ prefix and standard AWS_ prefix
        const accessKeyId = process.env.SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-2";

        if (!accessKeyId || !secretAccessKey) {
            console.error("SES Credentials Missing! Check your environment variables.");
            return NextResponse.json({ error: "SES Credentials missing on server" }, { status: 500 });
        }

        const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");

        const ses = new SESClient({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const weddingKeys: string[] = Array.isArray(attendingWeddings) ? attendingWeddings : [];
        const name = firstName || "there";
        const results: Record<string, any> = {};

        // 1. Send Guest Confirmation
        if (attending && typeof email === "string" && email.trim().length > 0) {
            const guestCommand = new SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: { ToAddresses: [email.trim()] },
                ReplyToAddresses: [REPLY_TO_EMAIL],
                Message: {
                    Subject: { Data: "You're confirmed! 🎉 Save the Date details inside", Charset: "UTF-8" },
                    Body: {
                        Html: { Data: buildGuestEmailHtml(name, weddingKeys), Charset: "UTF-8" },
                        Text: { Data: buildGuestEmailText(name, weddingKeys), Charset: "UTF-8" },
                    },
                },
            });

            try {
                const r = await ses.send(guestCommand);
                results.guestEmail = { success: true, messageId: r.MessageId };

                // Bookkeeping in Supabase
                try {
                    const supabase = await createClient();
                    await supabase
                        .from("guests")
                        .update({
                            confirmation_email_sent: true,
                            confirmation_email_sent_at: new Date().toISOString(),
                        })
                        .eq("id", guestId);
                } catch (dbErr) {
                    console.error("Failed to mark confirmation_email_sent in DB:", dbErr);
                }
            } catch (err: any) {
                console.error("AWS SES Guest Email Error:", err?.message || err);
                results.guestEmail = { success: false, error: err?.message || "SES send error" };
            }
        } else {
            results.guestEmail = { skipped: true, reason: !attending ? "Not attending" : "No email address provided" };
        }

        // 2. Send Internal Notification
        if (!skipInternalNotification) {
            const internalData = {
                firstName: name,
                lastName,
                guestId,
                email: typeof email === "string" ? email.trim() : undefined,
                phone: typeof phone === "string" ? phone.trim() : undefined,
                attending,
                attendingWeddings: weddingKeys,
                headcount: typeof headcount === "number" ? headcount : 0,
                mailingAddress: typeof mailingAddress === "string" && mailingAddress.trim() ? mailingAddress.trim() : undefined,
                smsConsent: !!smsConsent,
                declineNote: typeof declineNote === "string" && declineNote.trim() ? declineNote.trim() : undefined,
                bridal: !!bridal,
            };

            const internalCommand = new SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: { ToAddresses: INTERNAL_NOTIFY_EMAILS },
                ReplyToAddresses: [REPLY_TO_EMAIL],
                Message: {
                    Subject: {
                        Data: `${attending ? "✅" : "🌸"} ${name} just RSVP'd — ${attending ? weddingKeys.join(" + ") || "attending" : "declined"}`,
                        Charset: "UTF-8",
                    },
                    Body: {
                        Html: { Data: buildInternalEmailHtml(internalData), Charset: "UTF-8" },
                        Text: { Data: buildInternalEmailText(internalData), Charset: "UTF-8" },
                    },
                },
            });

            try {
                const r = await ses.send(internalCommand);
                results.internalEmail = { success: true, messageId: r.MessageId };
            } catch (err: any) {
                console.error("AWS SES Internal Email Error:", err?.message || err);
                results.internalEmail = { success: false, error: err?.message || "SES internal email error" };
            }
        } else {
            results.internalEmail = { skipped: true };
        }

        return NextResponse.json({ success: true, ...results });
    } catch (err: any) {
        console.error("Fatal /api/send-confirmation-email error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}