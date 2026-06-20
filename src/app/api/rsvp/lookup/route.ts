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
      return NextResponse.json(
        { error: "Invitation code not found" },
        { status: 404 }
      );
    }

    // rsvps is an array (PostgREST nested select) — guest has at most one
    const rsvp = Array.isArray((guest as any).rsvps)
      ? (guest as any).rsvps[0]
      : (guest as any).rsvps;

    // Derive which location(s) they already RSVP'd to, so returning guests
    // see their prior selection instead of a blank form
    let existingAttendance: "COLOMBIA" | "USA" | "BOTH" | "DECLINE" | null = null;
    if (rsvp) {
      if (rsvp.status === "DECLINED") {
        existingAttendance = "DECLINE";
      } else if (rsvp.colombia_attending && rsvp.usa_attending) {
        existingAttendance = "BOTH";
      } else if (rsvp.colombia_attending) {
        existingAttendance = "COLOMBIA";
      } else if (rsvp.usa_attending) {
        existingAttendance = "USA";
      }
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        firstName: guest.first_name,
        lastName: guest.last_name,
        email: guest.email,
        invitationCode: code,
        guestType: guest.guest_type,
        plusOneAllowed: guest.plus_one_allowed,
        tableNumber: guest.table_number,
      },
      existingAttendance,
      existingRsvp: rsvp
        ? {
            primaryEntree: rsvp.meal_preferences?.[0]?.entree ?? "",
            plusOneName: rsvp.plus_ones?.[0]?.first_name ?? "",
            plusOneLastName: rsvp.plus_ones?.[0]?.last_name ?? "",
            submittedAt: rsvp.submitted_at,
          }
        : null,
    });
  } catch (err: any) {
    console.error("RSVP lookup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
