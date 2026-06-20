import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getServerAuthUser } from "@/lib/auth-utils";

// Generates a readable invite code like "SMITH4F2A"
function generateInviteCode(lastName: string) {
  const base = lastName.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 6) || "GUEST";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

export async function POST(req: NextRequest) {
  const user = await getServerAuthUser();
  if (!user?.isBrideOrGroom) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, guestType, plusOneAllowed, side, notes } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("guests")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        invitation_code: generateInviteCode(lastName),
        guest_type: guestType ?? "CHOOSE_ONE",
        plus_one_allowed: !!plusOneAllowed,
        side: side || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ guest: data });
  } catch (err: any) {
    console.error("Create guest error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
