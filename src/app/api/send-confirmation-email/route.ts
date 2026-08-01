import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // adjust path if your project's differs

/**
 * HOW TO WIRE THIS UP (AWS SES):
 * 1. In the AWS SES console, verify the domain identity for causeycardenasforever.com
 *    (add the DKIM/DNS records SES gives you wherever your domain's DNS lives).
 *    Once verified, you can send from ANY address on that domain — no need to
 *    verify SaveTheDate@ separately.
 * 2. You're already out of the SES sandbox, so once the domain is verified
 *    you're fully unblocked — no waiting on recipient verification.
 * 3. `npm install @aws-sdk/client-ses` (skip if already installed).
 * 4. Env vars (.env.local + hosting provider):
 *      AWS_REGION            e.g. "us-east-1"
 *      AWS_ACCESS_KEY_ID
 *      AWS_SECRET_ACCESS_KEY
 *    Scope these to an IAM user/role with ses:SendEmail only.
 * 5. INTERNAL_NOTIFY_EMAILS below — set to whoever should get the
 *    "guest just responded" email (comma-separated if more than one).
 */

const FROM_EMAIL = "Jhoana & Damariel <SaveTheDate@causeycardenasforever.com>"; // must match verified SES domain identity
const REPLY_TO_EMAIL = "causeycardenas@gmail.com"; // guest replies land here, not the automated sender
const INTERNAL_NOTIFY_EMAILS = ["causeycardenas@gmail.com"]; // TODO: add a second address here if needed
const SITE_URL = "https://causeycardenasforever.com";

const WEDDING_LABELS: Record<string, string> = {
    Colombia: "Colombia — June 12, 2027 · Pereira",
    USA: "Gainesville — April 30, 2027 · Baughman Center",
};

// ---------- Guest-facing confirmation ----------

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

// ---------- Internal "a guest just responded" notification ----------

function buildInternalEmailHtml(data: {
    firstName: string;
    lastName?: string;
    guestId: string;
    email?: string;
    phone?: string;
    attending: boolean;
    attendingWeddings: string[];
    headcount: number;
    mailingAddress?: string;
    smsConsent: boolean;
    declineNote?: string;
    bridal?: boolean;
}) {
    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:6px 12px 6px 0; font-size:12px; color:#123B5499; white-space:nowrap; vertical-align:top;">${label}</td>
        <td style="padding:6px 0; font-size:13px; color:#123B54;">${value}</td>
      </tr>`;

    const weddingSummary = data.attending
        ? data.attendingWeddings.map((k) => WEDDING_LABELS[k] ?? k).join(" + ") || "—"
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

function buildInternalEmailText(data: {
    firstName: string;
    lastName?: string;
    guestId: string;
    email?: string;
    phone?: string;
    attending: boolean;
    attendingWeddings: string[];
    headcount: number;
    mailingAddress?: string;
    smsConsent: boolean;
    declineNote?: string;
    bridal?: boolean;
}) {
    const weddingSummary = data.attending
        ? data.attendingWeddings.map((k) => WEDDING_LABELS[k] ?? k).join(" + ") || "—"
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
            skipInternalNotification, // set true for admin-triggered resends
        } = body;

        if (!guestId || typeof attending !== "boolean") {
            return NextResponse.json({ error: "guestId and attending are required" }, { status: 400 });
        }

        // NOTE: using SES_* env var names, not AWS_* — Amplify reserves the
        // "AWS" prefix for its own runtime-injected credentials and will
        // reject any env var starting with it.
        const hasCreds = process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY;
        if (!hasCreds) {
            // Don't hard-fail the RSVP flow just because email isn't configured yet.
            console.warn("SES credentials not set — skipping confirmation/notification emails.");
            return NextResponse.json({ skipped: true, reason: "Email not configured yet" });
        }

        // Lazy import so this route doesn't hard-fail at build/import time if the
        // SES SDK isn't installed yet.
        const { SESClient, SendEmailCommand } = await import("@aws-sdk/client-ses");

        const ses = new SESClient({
            region: process.env.SES_REGION || "us-east-2",
            credentials: {
                accessKeyId: process.env.SES_ACCESS_KEY_ID!,
                secretAccessKey: process.env.SES_SECRET_ACCESS_KEY!,
            },
        });

        const weddingKeys: string[] = Array.isArray(attendingWeddings) ? attendingWeddings : [];
        const name = firstName || "there";
        const results: Record<string, any> = {};

        // 1. Guest-facing confirmation — only when attending something, and only
        //    if we actually have an email to send it to.
        if (attending && typeof email === "string" && email.trim()) {
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

                // Mark this guest as having received their confirmation, so the
                // admin dashboard's "pending" list and the resend tool both know
                // not to treat them as unsent.
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
                    // Don't fail the request over this — the email did send
                    // successfully, this is just bookkeeping.
                    console.error("Failed to mark confirmation_email_sent:", dbErr);
                }
            } catch (err: any) {
                console.error("Guest confirmation email failed:", err?.message ?? err);
                results.guestEmail = { success: false, error: err?.message };
            }
        } else {
            results.guestEmail = { skipped: true };
        }

        // 2. Internal notification — sent on every response, attending or not,
        //    unless the caller explicitly opted out (e.g. an admin bulk resend).
        if (skipInternalNotification) {
            results.internalEmail = { skipped: true };
            return NextResponse.json({ success: true, ...results });
        }

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
            console.error("Internal notification email failed:", err?.message ?? err);
            results.internalEmail = { success: false, error: err?.message };
        }

        return NextResponse.json({ success: true, ...results });
    } catch (err: any) {
        if (err?.name === "MessageRejected") {
            console.error("SES rejected the message (check sandbox mode / verified identities):", err.message);
        } else {
            console.error("send-confirmation-email (SES) error:", err);
        }
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}