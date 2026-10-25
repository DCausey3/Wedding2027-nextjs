import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const tw = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE = "https://causeycardenasforever.com";
const IMAGE_URL = "savedatw.png";

// ── Test controls ──
const DRY_RUN = true;                    // true = only logs, sends nothing
const TEST_GUEST_ID = "b9c5bce4-b1d8-4e71-bf38-f80493a0fd1a"; // set to null for full send
const TEST_TO_PHONE = "+18134641733";    // your own number (receives the test)

function buildMessage(g: any) {
  const name = g.first_name;
  const url = `${SITE}/?code=${g.invite_code}`; // adjust to your real RSVP route
  if (g.eligible_colombia) {
    return `¡Hola ${name}! Guarda la fecha. La fecha final aún se está confirmando para que puedas planear tu viaje. Tu código de invitación: ${g.invite_code}\n${url}`;
  }
  return `Hi ${name}! Save the date! Please have your passport ready and submit your email on our site for more info. Your invite code: ${g.invite_code}\n${url}`;
}

let query = db.from("guests").select("*");
if (TEST_GUEST_ID) {
  query = query.eq("id", TEST_GUEST_ID);
} else {
  query = query.is("std_sent_at", null).eq("sms_consent", true);
}

const { data: guests, error } = await query;
if (error) throw error;

for (const g of guests!) {
  const useWA = !!g.eligible_colombia;
  const rawTo = TEST_GUEST_ID ? TEST_TO_PHONE : useWA ? g.whatsapp || g.phone : g.phone;
  if (!rawTo) { console.warn("No phone for", g.id); continue; }

  const params = {
    body: buildMessage(g),
    mediaUrl: [IMAGE_URL],
    from: useWA ? process.env.TWILIO_WHATSAPP_FROM! : process.env.TWILIO_FROM!,
    to: useWA ? `whatsapp:${rawTo}` : rawTo,
  };

  if (DRY_RUN) { console.log("DRY RUN →", params.to, "\n", params.body, "\n"); continue; }

  try {
    const msg = await tw.messages.create(params);
    console.log("Sent", g.first_name, msg.sid);
    if (!TEST_GUEST_ID) {
      await db.from("guests")
        .update({ std_sent_at: new Date().toISOString(), std_twilio_sid: msg.sid })
        .eq("id", g.id);
    }
  } catch (e) {
    console.error("Failed", g.id, e);
  }
}