import { NextRequest, NextResponse } from "next/server";
import { updateRSVP } from "@/lib/data-client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { guestId, attendingColombia, attendingFlorida, plusOneName } = body;

        if (!guestId) {
            return NextResponse.json({ error: "guestId is required" }, { status: 400 });
        }

        const guest = await updateRSVP({
            guestId,
            colombiaAttending: !!attendingColombia,
            floridaAttending: !!attendingFlorida,
            plusOneName: plusOneName || undefined,
            plusOneAttending: !!plusOneName,
        });

        return NextResponse.json({ success: true, guestId: guest.id });
    } catch (err: any) {
        console.error("RSVP submit error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}