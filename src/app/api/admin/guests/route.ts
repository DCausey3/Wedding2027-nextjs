import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // adjust path if your project's differs

function isAdminEmail(email: string | null | undefined) {
    if (!email) return false;
    const admins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
    return admins.includes(email.toLowerCase());
}

export async function GET(req: NextRequest) {
    const requesterEmail = req.headers.get("x-admin-email");
    if (!isAdminEmail(requesterEmail)) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("guests")
        .select(
            "id, first_name, last_name, email, phone, selected_wedding, std_responded, std_attending_colombia, std_attending_florida, plus_one_count, confirmation_email_sent, role, invitation_type"
        )
        .order("last_name", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map snake_case DB columns to the camelCase shape the dashboard expects.
    const guests = (data ?? []).map((g: any) => ({
        id: g.id,
        firstName: g.first_name,
        lastName: g.last_name,
        email: g.email,
        phone: g.phone,
        selectedWedding: g.selected_wedding,
        stdResponded: g.std_responded,
        stdAttendingColombia: g.std_attending_colombia,
        stdAttendingFlorida: g.std_attending_florida,
        plusOneCount: g.plus_one_count,
        confirmationEmailSent: g.confirmation_email_sent,
        role: g.role,
        invitationType: g.invitation_type,
    }));

    return NextResponse.json({ guests });
}