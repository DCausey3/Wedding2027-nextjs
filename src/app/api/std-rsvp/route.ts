// Place at: app/api/std-rsvp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Sanity cap on children per invitation. Kids don't count against the plus-one
// allowance, but this stops a typo (or tampering) from adding hundreds of rows.
const MAX_CHILDREN = 8;

type PartyInput = {
    fullName?: string;
    memberType?: string;
    age?: number | string | null;
    attendingColombia?: boolean;
    attendingFlorida?: boolean;
};

type RosterRow = {
    guest_id: string;
    full_name: string;
    member_type: "adult" | "child";
    age: number | null;
    attending_colombia: boolean;
    attending_florida: boolean;
};

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            guestId, attending, attendingWeddings, party, headcount,
            phone, email, mailingAddress, smsConsent, declineNote,
        } = body;

        // `attending` is about the invited guest themselves. Their party members
        // can attend even when the invited guest can't (aunts, cousins, etc.).
        if (!guestId || typeof attending !== "boolean") {
            return fail("guestId and attending are required");
        }

        const supabase = createAdminClient();

        // Read eligibility and limits from the database, never from the client.
        const { data: guest, error: guestErr } = await supabase
            .from("guests")
            .select("id, selected_wedding, plus_one_allowed, plus_one_count")
            .eq("id", guestId)
            .maybeSingle();
        if (guestErr) {
            console.error("Failed to look up guest for RSVP:", guestErr);
            return fail("Unable to look up guest", 500);
        }
        if (!guest) return fail("Guest not found", 404);

        // selected_wedding decides which choices the page shows.
        // null means "may pick either" (same as the page today).
        const sel = guest.selected_wedding as string | null;
        const eligibleColombia = sel == null || sel === "Colombia" || sel === "Both";
        const eligibleFlorida = sel == null || sel === "USA" || sel === "Both"; // "USA" = the Gainesville wedding; DB column stays "florida"

        const weddingKeys: string[] = Array.isArray(attendingWeddings) ? attendingWeddings : [];
        const wantsColombia = attending && weddingKeys.includes("Colombia");
        const wantsFlorida = attending && weddingKeys.includes("USA");

        if ((wantsColombia && !eligibleColombia) || (wantsFlorida && !eligibleFlorida)) {
            return fail("Your invitation doesn't include that wedding", 403);
        }

        // plus_one_count = how many EXTRA ADULTS this invitation allows.
        const maxExtras = guest.plus_one_allowed ? Math.max(0, guest.plus_one_count ?? 0) : 0;

        // ---- Party roster (processed whether or not the invited guest attends) ----
        let roster: RosterRow[] | null = null;
        if (Array.isArray(party)) {
            // Unused spots (no name and not attending anything) are simply dropped.
            const items = (party as PartyInput[]).filter(
                (p) => (typeof p?.fullName === "string" && p.fullName.trim()) || p?.attendingColombia || p?.attendingFlorida,
            );
            const adults = items.filter((p) => p.memberType !== "child");
            const kids = items.filter((p) => p.memberType === "child");

            if (adults.length > maxExtras) {
                return fail(`Your invitation allows up to ${maxExtras} additional guest${maxExtras === 1 ? "" : "s"}`);
            }
            if (kids.length > MAX_CHILDREN) {
                return fail(`Please contact us if you're bringing more than ${MAX_CHILDREN} children`);
            }

            roster = [];
            let childNumber = 0;
            for (const p of items) {
                const isChild = p.memberType === "child";
                let fullName = typeof p.fullName === "string" ? p.fullName.trim().slice(0, 100) : "";

                if (isChild) {
                    childNumber += 1;
                    if (!fullName) fullName = `Child ${childNumber}`; // names are optional for kids
                } else if (!fullName) {
                    return fail("Every adult in your party needs a name");
                }

                // Age is optional; if it's given it has to make sense.
                let age: number | null = null;
                if (isChild && p.age !== null && p.age !== undefined && p.age !== "") {
                    const n = Number(p.age);
                    if (!Number.isInteger(n) || n < 0 || n > 17) return fail("Please enter a valid age for each child");
                    age = n;
                }

                const aC = !!p.attendingColombia;
                const aF = !!p.attendingFlorida;
                if ((aC && !eligibleColombia) || (aF && !eligibleFlorida)) {
                    return fail("A guest in your party was selected for a wedding your invitation doesn't include", 403);
                }

                roster.push({
                    guest_id: guestId,
                    full_name: fullName,
                    member_type: isChild ? "child" : "adult",
                    age,
                    attending_colombia: aC,
                    attending_florida: aF,
                });
            }
        }

        const attendingMembers = roster ? roster.filter((m) => m.attending_colombia || m.attending_florida).length : 0;
        const anyoneAttending = attending || attendingMembers > 0;

        // Someone is coming, so we need a way to reach the person who RSVP'd.
        if (anyoneAttending && (!phone?.trim() || !email?.trim())) {
            return fail("Phone and email are required to confirm attendance");
        }

        // ---- Confirmed total: the guest (if attending) plus every party member attending something ----
        let guestCount = 0;
        if (roster) {
            guestCount = (attending ? 1 : 0) + attendingMembers;
        } else if (attending) {
            // Legacy clients that still send a plain headcount
            guestCount = Math.max(1, Math.min(Number(headcount) || 1, maxExtras + 1));
        }

        const updates: Record<string, any> = {
            std_responded: true,
            std_responded_at: new Date().toISOString(),
            std_attending_colombia: wantsColombia,
            std_attending_florida: wantsFlorida,
            guest_count: guestCount,
            updated_at: new Date().toISOString(),
            // plus_one_count is deliberately NOT overwritten: it's the invitation's allowance.
        };

        if (roster) {
            const firstAdult = roster.find((m) => m.member_type === "adult");
            updates.plus_one_name = firstAdult?.full_name ?? null; // legacy field, kept in sync
            updates.plus_one_attending = attendingMembers > 0;
        } else if (!attending) {
            updates.plus_one_attending = false;
        } else {
            updates.plus_one_attending = guestCount > 1;
        }

        if (anyoneAttending) {
            updates.phone = phone.trim();
            updates.email = email.trim();
            updates.sms_consent = !!smsConsent;
            if (smsConsent) updates.sms_consent_date = new Date().toISOString();
        }

        if (typeof mailingAddress === "string" && mailingAddress.trim()) {
            updates.mailing_address = mailingAddress.trim();
        }

        // decline_reason (not `notes`, which holds your admin notes) is the invited guest's own reason.
        if (!attending) {
            if (typeof declineNote === "string" && declineNote.trim()) {
                updates.decline_reason = declineNote.trim().slice(0, 1000);
            }
        } else {
            updates.decline_reason = null; // they changed their mind; don't leave a stale reason behind
        }

        // ---- Write: insert new roster rows, update the guest, then remove the old rows ----
        // (insert-before-delete so a failed insert never wipes an existing party)
        const replaceRoster = roster !== null || !attending;
        let oldIds: string[] = [];
        if (replaceRoster) {
            const { data: oldRows, error: oldErr } = await supabase
                .from("guest_plus_ones")
                .select("id")
                .eq("guest_id", guestId);
            if (oldErr) throw new Error(oldErr.message);
            oldIds = (oldRows ?? []).map((r: { id: string }) => r.id);
        }

        if (roster && roster.length > 0) {
            const { error: insErr } = await supabase.from("guest_plus_ones").insert(roster);
            if (insErr) throw new Error(insErr.message);
        }

        const { data, error } = await supabase
            .from("guests")
            .update(updates)
            .eq("id", guestId)
            .select("id")
            .single();
        if (error) throw new Error(error.message);

        if (oldIds.length > 0) {
            const { error: delErr } = await supabase.from("guest_plus_ones").delete().in("id", oldIds);
            if (delErr) throw new Error(delErr.message);
        }

        return NextResponse.json({ success: true, guestId: data.id, guestCount, anyoneAttending });
    } catch (err: any) {
        console.error("Save-the-date RSVP error:", err);
        return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
    }
}