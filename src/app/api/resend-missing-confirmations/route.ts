import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch all guests who responded but haven't received their confirmation email
        const { data: guests, error } = await supabase
            .from("guests")
            .select("*")
            .eq("std_responded", true)
            .or("confirmation_email_sent.eq.false,confirmation_email_sent.is.null");

        if (error) {
            console.error("Failed to query guests:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!guests || guests.length === 0) {
            return NextResponse.json({
                message: "No guests found needing confirmation email backfill.",
                processedCount: 0,
            });
        }

        const results = [];
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://causeycardenasforever.com";

        // Optional query param / body flag to enable internal admin emails if desired
        let sendInternalAlerts = false;
        try {
            const body = await req.json();
            if (body.sendInternalAlerts === true) {
                sendInternalAlerts = true;
            }
        } catch {
            // Request body was empty, default to false
        }

        // 2. Loop through each guest and trigger the confirmation endpoint
        for (const guest of guests) {
            if (!guest.email || !guest.email.trim()) {
                results.push({
                    guestId: guest.id,
                    name: `${guest.first_name} ${guest.last_name}`,
                    status: "skipped",
                    reason: "No email address on record",
                });
                continue;
            }

            const attendingWeddings: string[] = [];
            if (guest.std_attending_colombia) attendingWeddings.push("Colombia");
            if (guest.std_attending_florida || guest.std_attending_usa) attendingWeddings.push("USA");

            const isAttending = attendingWeddings.length > 0;

            try {
                const emailRes = await fetch(`${baseUrl}/api/send-confirmation-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        guestId: guest.id,
                        firstName: guest.first_name,
                        lastName: guest.last_name,
                        email: guest.email,
                        phone: guest.phone,
                        attending: isAttending,
                        attendingWeddings,
                        headcount: guest.headcount || 1,
                        mailingAddress: guest.mailing_address,
                        smsConsent: guest.sms_consent || false,
                        declineNote: guest.decline_note,
                        bridal: guest.role === "bridal_party" || guest.invitation_type === "bridal_party",
                        skipInternalNotification: !sendInternalAlerts, // Set to true to suppress admin alerts, or false to receive them!
                    }),
                });

                const json = await emailRes.json();

                results.push({
                    guestId: guest.id,
                    name: `${guest.first_name} ${guest.last_name}`,
                    email: guest.email,
                    status: emailRes.ok ? "sent" : "failed",
                    response: json,
                });
            } catch (err: any) {
                results.push({
                    guestId: guest.id,
                    name: `${guest.first_name} ${guest.last_name}`,
                    status: "error",
                    error: err.message,
                });
            }
        }

        return NextResponse.json({
            message: `Processed ${results.length} guest records.`,
            results,
        });
    } catch (err: any) {
        console.error("Backfill route error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}