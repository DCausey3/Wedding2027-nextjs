import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getServerAuthUser } from "@/lib/auth-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerAuthUser();
  if (!user?.isBrideOrGroom) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, any> = {};
    if (body.firstName !== undefined) updates.first_name = body.firstName;
    if (body.lastName !== undefined) updates.last_name = body.lastName;
    if (body.email !== undefined) updates.email = body.email || null;
    if (body.phone !== undefined) updates.phone = body.phone || null;
    if (body.guestType !== undefined) updates.guest_type = body.guestType;
    if (body.plusOneAllowed !== undefined) updates.plus_one_allowed = body.plusOneAllowed;
    if (body.tableNumber !== undefined) updates.table_number = body.tableNumber;
    if (body.side !== undefined) updates.side = body.side || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ guest: data });
  } catch (err: any) {
    console.error("Update guest error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerAuthUser();
  if (!user?.isBrideOrGroom) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete guest error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
