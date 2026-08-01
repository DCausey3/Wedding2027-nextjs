import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // adjust path if your project's differs

/**
 * GET  /api/admin/resend-confirmations
 *   -> returns guests who are attending (std_responded=true, attending
 *      something) but haven't gotten a confirmation email yet.
 *
 * POST /api/admin/resend-confirmations  { guestId }  -> resend to one guest
 * POST /api/admin/resend-confirmations  { all: true } -> resend to everyone pending
 *
 * Auth: this checks the requester's email against ADMIN_EMAILS. Adjust the
 * isAdmin check below to match however your session/cookie actually carries
 * the logged-in guest's email — this assumes it's passed as a header or you
 * wire it to your existing session lookup.
 */

function isAdminEmail(email: string | null | undefined) {
    if (!email) return false;
    const admins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return admins.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
    const requesterEmail = req.headers.get("x-admin-email"); // TODO: wire to real session
    if (!isAdminEmail(requesterEmail)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("guests")
        .select("id, first_name, last_name, email, phone, std_attending_colombia, std_attending_florida, std_responded, confirmation_email_sent, confirmation_email_sent_at")
        .eq("std_responded", true)
        .or("std_attending_colombia.eq.true,std_attending_florida.eq.true")
        .eq("confirmation_email_sent", false);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pending: data });
}

export async function POST(req: NextRequest) {
    const requesterEmail = req.headers.get("x-admin-email"); // TODO: wire to real session
    if (!isAdminEmail(requesterEmail)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const { guestId, all } = body;
    const supabase = await createClient();

    let targets: any[] = [];

    if (all) {
        const { data, error } = await supabase
            .from("guests")
            .select("id, first_name, last_name, email, std_attending_colombia, std_attending_florida, plus_one_count")
            .eq("std_responded", true)
            .or("std_attending_colombia.eq.true,std_attending_florida.eq.true")
            .eq("confirmation_email_sent", false);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        targets = data ?? [];
    } else if (guestId) {
        const { data, error } = await supabase
            .from("guests")
            .select("id, first_name, last_name, email, std_attending_colombia, std_attending_florida, plus_one_count")
            .eq("id", guestId)
            .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        targets = data ? [data] : [];
    } else {
        return NextResponse.json({ error: "Provide guestId or all:true" }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const results = [];

    for (const guest of targets) {
        if (!guest.email) {
            results.push({ guestId: guest.id, skipped: "no email on file" });
            continue;
        }

        const attendingWeddings = [
            guest.std_attending_colombia ? "Colombia" : null,
            guest.std_attending_florida ? "USA" : null,
        ].filter(Boolean);

        try {
            const res = await fetch(`${origin}/api/send-confirmation-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestId: guest.id,
                    firstName: guest.first_name,
                    lastName: guest.last_name,
                    email: guest.email,
                    attending: true,
                    attendingWeddings,
                    headcount: guest.plus_one_count ?? 1,
                    skipInternalNotification: true,
                }),
            });
            const json = await res.json();
            results.push({ guestId: guest.id, ...json });
        } catch (err: any) {
            results.push({ guestId: guest.id, error: err.message });
        }
    }

    return NextResponse.json({ success: true, sent: results.length, results });
}