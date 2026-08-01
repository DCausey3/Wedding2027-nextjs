import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Prevent Next.js from attempting static evaluation during build phase
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase env variables in runtime environment");
            return NextResponse.json({ authorized: false, error: "Server configuration error" }, { status: 500 });
        }

        // Initialize client inside the request handler
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

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