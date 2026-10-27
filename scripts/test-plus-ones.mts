import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, realtime: { transport: ws as any } }
);

const { data, error } = await db
  .from("guest_plus_ones")
  .insert({
    guest_id: "d25262ca-1acf-481c-bd31-49a1fbea6ee7",
    full_name: "TEST DELETE ME",
    member_type: "adult",
    attending_colombia: true,
    attending_florida: true,
  })
  .select()
  .single();

console.log("insert:", error ? error.message : "OK");
if (data) await db.from("guest_plus_ones").delete().eq("id", data.id);