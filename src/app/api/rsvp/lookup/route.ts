import { NextRequest, NextResponse } from "next/server";
import {
    getGuestByInvitationCode,
    getGuestByEmail,
    getGuestByPhone,
} from "@/lib/data-client";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    const email = req.nextUrl.searchParams.get("email");
    const phone = req.nextUrl.searchParams.get("phone");

    if (!code && !email && !phone) {
        return NextResponse.json(
            { error: "code, email, or phone is required" },
            { status: 400 }
        );
    }

    try {
        let guest = null;

        if (code) {
            guest = await getGuestByInvitationCode(code);
        } else if (email) {
            guest = await getGuestByEmail(email);
        } else if (phone) {
            guest = await getGuestByPhone(phone);
        }

        if (!guest) {
            return NextResponse.json(
                { error: "Invitation not found. Please verify your details and try again." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            guest: {
                id: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                eligibleColombia: guest.eligibleColombia,
                plusOneAllowed: guest.plusOneAllowed,
                plusOneCount: guest.plusOneCount,
                selectedWedding: guest.selectedWedding,
                stdResponded: guest.stdResponded,
                role:guest.role,
                invitationType: guest.invitationType,
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