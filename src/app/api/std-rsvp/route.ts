import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getGuestById } from "@/lib/data-client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { guestId, attending, headcount, phone, email, smsConsent, declineNote } = body;

        if (!guestId || typeof attending !== "boolean") {
            return NextResponse.json(
                { error: "guestId and attending are required" },
                { status: 400 }
            );
        }

        const guest = await getGuestById(guestId);
        if (!guest) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        // Accepting requires phone + email on this flow
        if (attending && (!phone?.trim() || !email?.trim())) {
            return NextResponse.json(
                { error: "Phone and email are required to confirm attendance" },
                { status: 400 }
            );
        }

        const maxHeadcount = guest.plusOneCount ?? 1;
        const safeHeadcount = attending
            ? Math.max(1, Math.min(headcount ?? maxHeadcount, maxHeadcount))
            : 0;

        const supabase = await createClient();

        const updates: Record<string, any> = {
            std_responded: true,
            std_attending_colombia: attending && guest.selectedWedding === "Colombia",
            std_attending_florida: attending && guest.selectedWedding === "USA",
        };

        if (guest.selectedWedding === "Both") {
            updates.std_attending_colombia = attending;
            updates.std_attending_florida = attending;
        }

        updates.plus_one_count = safeHeadcount;
        updates.plus_one_attending = safeHeadcount > 1;

        if (attending) {
            updates.phone = phone.trim();
            updates.email = email.trim();
            updates.sms_consent = !!smsConsent;
        }

        // Decline reason — only meaningful for Colombia declines (per scope),
        // but store whatever's passed since the column is general-purpose.
        if (!attending && declineNote?.trim()) {
            updates.notes = declineNote.trim();
        }

        const { data, error } = await supabase
            .from("guests")
            .update(updates)
            .eq("id", guestId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, guestId: data.id });
    } catch (err: any) {
        console.error("Save-the-date RSVP error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}