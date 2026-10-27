// Place at: app/api/guest-party/route.ts
// Returns a guest's allowance, their own saved attendance, and any party members
// they've already saved, so pages always show fresh numbers from the database
// (not whatever was cached in sessionStorage at login).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
    const guestId = req.nextUrl.searchParams.get("guest");
    if (!guestId) {
        return NextResponse.json({ error: "guest is required" }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        const { data: guest, error } = await supabase
            .from("guests")
            .select("id, selected_wedding, plus_one_allowed, plus_one_count, children_allowed, std_responded, std_attending_colombia, std_attending_florida, guest_count")
            .eq("id", guestId)
            .single();
        if (error || !guest) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        const { data: rows, error: rowsErr } = await supabase
            .from("guest_plus_ones")
            .select("id, full_name, member_type, age, attending_colombia, attending_florida, created_at")
            .eq("guest_id", guestId)
            .order("created_at", { ascending: true });
        if (rowsErr) throw new Error(rowsErr.message);

        return NextResponse.json({
            selectedWedding: guest.selected_wedding ?? null,
            // plus_one_count = extra adults this invitation allows (not counting the guest or kids)
            plusOneCount: guest.plus_one_allowed ? Math.max(0, guest.plus_one_count ?? 0) : 0,
            childrenAllowed: !!guest.children_allowed,
            stdResponded: !!guest.std_responded,
            stdAttendingColombia: !!guest.std_attending_colombia,
            stdAttendingFlorida: !!guest.std_attending_florida,
            guestCount: guest.guest_count ?? null,
            party: (rows ?? []).map((r: any) => ({
                fullName: r.full_name ?? "",
                memberType: r.member_type === "child" ? "child" : "adult",
                age: r.age ?? null,
                attendingColombia: !!r.attending_colombia,
                attendingFlorida: !!r.attending_florida,
            })),
        });
    } catch (err: any) {
        console.error("Guest party lookup error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}