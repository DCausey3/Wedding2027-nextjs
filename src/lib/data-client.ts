/**
 * Supabase query helpers — server-side only.
 * Uses the anon client for reads (RLS applies) and the publishable key
 * for writes via API routes (service role key not needed with proper RLS).
 */

import { createClient } from "@/utils/supabase/server";

// ── Guest Queries ──────────────────────────────────────────────────────────────

export async function getGuestByInvitationCode(code: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("invite_code", code.trim().toUpperCase())
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapGuestRow(data) : null;
}

export async function getAllGuests() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("last_name", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapGuestRow);
}
export async function getGuestByEmail(email: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .select("*")
        .ilike("email", email.trim())
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapGuestRow(data) : null;
}

export async function getGuestByPhone(phone: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("phone", phone.trim())
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapGuestRow(data) : null;
}

export async function getGuestById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapGuestRow(data) : null;
}
// ── Row mapping: snake_case (DB) → camelCase (app/components) ─────────────────
function mapGuestRow(row: any) {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        invitationCode: row.invite_code,
        invitationType: row.invitation_type,
        role: row.role,
        selectedWedding: row.selected_wedding,
        attendingColombia: row.attending_colombia,
        attendingFlorida: row.attending_florida,
        plusOneAllowed: row.plus_one_allowed,
        notes: row.notes,
        createdAt: row.created_at,
        stdResponded: row.std_responded,
        stdAttendingColombia: row.std_attending_colombia,
        stdAttendingFlorida: row.std_attending_florida,
        inviteSent: row.invite_sent,
        rsvpResponded: row.rsvp_responded,
        eligibleColombia: row.eligible_colombia,
        plusOneName: row.plus_one_name,
        plusOneAttending: row.plus_one_attending,
        partyGroupId: row.party_group_id,
        plusOneCount: row.plus_one_count,
        mailingAddress: row.mailing_address,
    };
}

export async function updateGuest(id: string, updates: Record<string, any>) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("guests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

// ── RSVP Update ───────────────────────────────────────────────────────────────

export async function updateRSVP(payload: {
    guestId: string;
    colombiaAttending: boolean;
    floridaAttending: boolean;
    plusOneName?: string;
    plusOneAttending?: boolean;
    notes?: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("guests")
        .update({
            attending_colombia: payload.colombiaAttending,
            attending_florida: payload.floridaAttending,
            rsvp_responded: true,
            plus_one_name: payload.plusOneName ?? null,
            plus_one_attending: payload.plusOneAttending ?? false,
            notes: payload.notes ?? null,
        })
        .eq("id", payload.guestId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// ── Dashboard Stats ────────────────────────────────────────────────────────────

export async function getDashboardStats() {
    const supabase = await createClient();

    const { data: guests, error } = await supabase
        .from("guests")
        .select("*");

    if (error) throw new Error(error.message);
    if (!guests) return null;

    let totalInvited = guests.length;
    let accepted = 0;
    let declined = 0;
    let pending = 0;
    let colombiaCount = 0;
    let floridaCount = 0;
    let bothCount = 0;
    let plusOneCount = 0;

    guests.forEach((guest) => {
        // Determine overall RSVP statuses
        if (guest.rsvp_responded) {
            if (guest.attending_colombia || guest.attending_florida) {
                accepted++;
            } else {
                declined++;
            }
        } else {
            pending++;
        }

        // Attendance overlaps
        if (guest.attending_colombia && guest.attending_florida) {
            bothCount++;
        }
        if (guest.attending_colombia) {
            colombiaCount++;
        }
        if (guest.attending_florida) {
            floridaCount++;
        }

        // Plus one tracking metrics
        if (guest.plus_one_attending) {
            plusOneCount++;
            totalInvited++; // Add plus-ones to total head counts if they are coming

            if (guest.attending_colombia) colombiaCount++;
            if (guest.attending_florida) floridaCount++;
        }
    });

    return {
        totalInvited,
        accepted,
        declined,
        pending,
        colombiaCount,
        floridaCount,
        bothCount,
        plusOneCount,
    };
}