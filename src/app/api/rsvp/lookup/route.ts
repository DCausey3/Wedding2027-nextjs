import { NextRequest, NextResponse } from "next/server";
import { getGuestByInvitationCode } from "@/lib/data-client";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
        return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    try {
        const guest = await getGuestByInvitationCode(code);
        if (!guest) {
            return NextResponse.json({ error: "Invitation code not found" }, { status: 404 });
        }

        return NextResponse.json({
            guest: {
                id: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                eligibleColombia: guest.eligibleColombia,
                plusOneAllowed: guest.plusOneAllowed,
            },
            previousResponse: guest.stdResponded
                ? {
                    attendingColombia: guest.stdAttendingColombia,
                    attendingFlorida: guest.stdAttendingFlorida,
                }
                : null,
        });
    } catch (err: any) {
        console.error("RSVP lookup error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}