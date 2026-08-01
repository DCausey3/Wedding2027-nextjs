import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key to bypass RLS for admin checks, or ANON key if standard select policy is enabled
);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ authorized: false }, { status: 400 });
        }

        // Query Supabase for the guest matching the email and role
        const { data: guest, error } = await supabase
            .from("guests")
            .select("id, email, role, first_name, last_name")
            .eq("email", email.trim().toLowerCase())
            .in("role", ["Bride", "Groom"])
            .maybeSingle();

        if (error || !guest) {
            return NextResponse.json({ authorized: false }, { status: 403 });
        }

        return NextResponse.json({
            authorized: true,
            guest,
        });
    } catch (err) {
        console.error("Admin verification error:", err);
        return NextResponse.json({ authorized: false }, { status: 500 });
    }
}