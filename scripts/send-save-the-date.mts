import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const tw = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws as any },
  }
);

const SITE = "https://causeycardenasforever.com";
const LOGIN_PATH = "/"; // page that reads ?code= and prefills the invite code

type Wedding = "both" | "colombia" | "usa";
type Lang = "en" | "es";

// Images in /public. File names are case-sensitive on the live site.
// "usa" = Gainesville. Colombia and both use the same image for each language
// until you create Spanish/English versions; then swap the file names below.
const IMAGES: Record<Wedding, Record<Lang, string>> = {
  usa: {
    en: `${SITE}/STD-G-english.png`,
    es: `${SITE}/STD-G-spanish.png`,
  },
  colombia: {
    en: `${SITE}/STD-C-english.png`,
    es: `${SITE}/STD-C-spanish.png`,
  },
  both: {
    en: `${SITE}/STD-both-english.png`,
    es: `${SITE}/STD-both-spanish.png`,
  },
};
const FALLBACK_IMAGE = `${SITE}/savedatw.png`;

// ── Test controls ──
const DRY_RUN = false;
const TEST_GUEST_ID: string | null = "b9c5bce4-b1d8-4e71-bf38-f80493a0fd1a"; // null = full send
const TEST_TO_PHONE = "+18134641733";
const TEST_FORCE_WEDDING: Wedding | null = null; // preview a wedding variant on your own row
const TEST_FORCE_SPANISH: boolean | null = null; // true/false to preview a language on your own row

function isTrue(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "true" || s === "t" || s === "yes" || s === "1";
}

function normalizeWedding(v: unknown): Wedding | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "both") return "both";
  if (s === "colombia") return "colombia";
  if (s === "usa" || s === "us" || s === "united states") return "usa";
  return null;
}

function buildMessage(g: any, wedding: Wedding, lang: Lang) {
  const name = g.first_name;
  const url = `${SITE}${LOGIN_PATH}?code=${encodeURIComponent(g.invite_code)}`;

  const copy: Record<Lang, Record<Wedding, string[]>> = {
    es: {
      colombia: [
        `💍 ¡${name}, tienes una invitación esperándote!`,
        ``,
        `Nos casamos en Colombia 🇨🇴 el 12 de junio de 2027 y no sería lo mismo sin ti.`,
        ``,
        `✨ Toca aquí para abrir tu invitación. Tu código ya está listo:`,
        url,
        ``,
        `Tu código: ${g.invite_code}`,
      ],
      usa: [
        `💍 ¡${name}, tienes una invitación esperándote!`,
        ``,
        `Nos casamos en Gainesville, Florida 🇺🇸 el 24 de abril de 2027 y no sería lo mismo sin ti.`,
        ``,
        `✨ Toca aquí para abrir tu invitación. Tu código ya está listo:`,
        url,
        ``,
        `Tu código: ${g.invite_code}`,
      ],
      both: [
        `💍 ¡${name}, dos celebraciones, una invitación!`,
        ``,
        `🇺🇸 Gainesville, Florida: 24 de abril de 2027`,
        `🇨🇴 Colombia: 12 de junio de 2027`,
        ``,
        `Nos encantaría celebrar contigo en ambas. ✨ Toca aquí para abrir tu invitación. Tu código ya está listo:`,
        url,
        ``,
        `Tu código: ${g.invite_code}`,
      ],
    },
    en: {
      colombia: [
        `💍 ${name}, you're invited!`,
        ``,
        `We're getting married in Colombia 🇨🇴 on June 12, 2027, and we can't imagine the day without you.`,
        ``,
        `✨ Tap below to open your invitation. Your code is already filled in:`,
        url,
        ``,
        `Your code: ${g.invite_code}`,
      ],
      usa: [
        `💍 ${name}, you're invited!`,
        ``,
        `We're getting married in Gainesville, Florida 🇺🇸 on April 24, 2027, and we can't imagine the day without you.`,
        ``,
        `✨ Tap below to open your invitation. Your code is already filled in:`,
        url,
        ``,
        `Your code: ${g.invite_code}`,
      ],
      both: [
        `💍 ${name}, two celebrations, one invitation!`,
        ``,
        `🇺🇸 Gainesville, Florida: April 24, 2027`,
        `🇨🇴 Colombia: June 12, 2027`,
        ``,
        `We'd love to celebrate with you at both. ✨ Tap below to open your invitation. Your code is already filled in:`,
        url,
        ``,
        `Your code: ${g.invite_code}`,
      ],
    },
  };

  return copy[lang][wedding].join("\n");
}

async function main() {
  let query = db.from("guests").select("*");
  if (TEST_GUEST_ID) query = query.eq("id", TEST_GUEST_ID);
  else query = query.is("std_sent_at", null).eq("sms_consent", true);

  const { data: guests, error } = await query;
  if (error) throw error;

  for (const g of guests!) {
    // Guests marked whatsapp = true are handled outside this script, so skip them.
    // (Bypassed in test mode so you can still preview on your own row.)
    if (!TEST_GUEST_ID && isTrue(g.whatsapp)) {
      console.log("Skipping (whatsapp = true):", g.first_name, g.id);
      continue;
    }

    const wedding = TEST_FORCE_WEDDING ?? normalizeWedding(g.selected_wedding);
    if (!wedding) {
      console.warn("Skipping, unknown selected_wedding:", g.id, g.selected_wedding);
      continue;
    }

    const spanish = TEST_FORCE_SPANISH ?? isTrue(g.spanish);
    const lang: Lang = spanish ? "es" : "en";

    const to = TEST_GUEST_ID ? TEST_TO_PHONE : g.phone;
    if (!to) { console.warn("No phone for", g.id); continue; }

    const params = {
      body: buildMessage(g, wedding, lang),
      mediaUrl: [IMAGES[wedding]?.[lang] ?? FALLBACK_IMAGE],
      from: process.env.TWILIO_FROM!,
      to,
    };

    if (DRY_RUN) {
      console.log(`DRY RUN [${wedding}/${lang}] →`, params.to, "\n" + params.body, "\n", params.mediaUrl, "\n");
      continue;
    }

    try {
      const msg = await tw.messages.create(params);
      console.log("Sent", g.first_name, wedding, lang, msg.sid);
      if (!TEST_GUEST_ID) {
        await db.from("guests")
          .update({ std_sent_at: new Date().toISOString(), std_twilio_sid: msg.sid })
          .eq("id", g.id);
      }
    } catch (e) {
      console.error("Failed", g.id, e);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
