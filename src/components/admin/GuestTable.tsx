"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Loader2, Trash2 } from "lucide-react";
import type { Guest, GuestType } from "@/types";

const GUEST_TYPES: GuestType[] = [
  "COLOMBIA_ONLY",
  "USA_ONLY",
  "BOTH",
  "CHOOSE_ONE",
  "BRIDAL_PARTY",
];

type EditableGuest = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guestType: GuestType;
  plusOneAllowed: boolean;
  side: "" | "BRIDE" | "GROOM" | "BOTH";
  notes: string;
};

const BLANK_GUEST: EditableGuest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  guestType: "CHOOSE_ONE",
  plusOneAllowed: false,
  side: "",
  notes: "",
};

export function GuestTable({ guests }: { guests: Guest[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditableGuest | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.firstName.toLowerCase().includes(q) ||
      g.lastName.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.invitationCode?.toLowerCase().includes(q)
    );
  });

  const statusColor: Record<string, string> = {
    ACCEPTED: "#059669",
    DECLINED: "#ef4444",
    PENDING: "#d4a574",
  };

  function openEdit(g: Guest) {
    setEditing({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email ?? "",
      phone: (g as any).phone ?? "",
      guestType: g.guestType,
      plusOneAllowed: g.plusOneAllowed,
      side: (g.side as any) ?? "",
      notes: g.notes ?? "",
    });
  }

  function openAdd() {
    setEditing({ ...BLANK_GUEST });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const url = isNew ? "/api/admin/guests" : `/api/admin/guests/${editing.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Save failed");
      }

      setEditing(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this guest? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <input
          type="search"
          placeholder="Search guests…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 rounded-xl text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none"
        />
        <button onClick={openAdd} className="btn-gold flex items-center gap-2">
          <Plus size={14} />
          Add Guest
        </button>
      </div>

      <div className="card-wedding overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-champagne">
              {["Name", "Email", "Type", "Code", "RSVP", "Plus Ones", ""].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 pr-4 label-overline text-dark/30 font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => {
              const status = (g.rsvp as any)?.status ?? "PENDING";
              const plusOnes = (g.rsvp as any)?.plusOnes?.length ?? 0;
              return (
                <tr
                  key={g.id}
                  className="border-b border-champagne/50 hover:bg-champagne/20 transition-colors cursor-pointer"
                  onClick={() => openEdit(g)}
                >
                  <td className="py-3 pr-4 font-medium text-dark whitespace-nowrap">
                    {g.firstName} {g.lastName}
                  </td>
                  <td className="py-3 pr-4 text-dark/50 text-xs">{g.email ?? "—"}</td>
                  <td className="py-3 pr-4 text-dark/50 text-xs uppercase tracking-wide whitespace-nowrap">
                    {g.guestType?.replace(/_/g, " ") ?? "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-dark/60">
                    {g.invitationCode}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                      style={{ backgroundColor: statusColor[status] }}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-3 text-dark/50">{plusOnes}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(g.id);
                      }}
                      disabled={deletingId === g.id}
                      className="text-dark/30 hover:text-red-500 transition-colors p-1"
                      aria-label={`Delete ${g.firstName} ${g.lastName}`}
                    >
                      {deletingId === g.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-dark/40 py-8">
            {search ? "No results for your search." : "No guests yet."}
          </p>
        )}
      </div>
      <p className="text-xs text-dark/30 mt-3">
        {filtered.length} of {guests.length} guests
      </p>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !saving && setEditing(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-light text-dark">
                {editing.id ? "Edit Guest" : "Add Guest"}
              </h3>
              <button onClick={() => setEditing(null)} className="text-dark/40 hover:text-dark">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-overline text-dark/50 block mb-1.5">First Name</label>
                  <input
                    value={editing.firstName}
                    onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="label-overline text-dark/50 block mb-1.5">Last Name</label>
                  <input
                    value={editing.lastName}
                    onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="label-overline text-dark/50 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                />
              </div>

              <div>
                <label className="label-overline text-dark/50 block mb-1.5">
                  Phone (for WhatsApp later)
                </label>
                <input
                  type="tel"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  placeholder="+1 555 555 5555"
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                />
              </div>

              <div>
                <label className="label-overline text-dark/50 block mb-1.5">Invite Type</label>
                <select
                  value={editing.guestType}
                  onChange={(e) =>
                    setEditing({ ...editing, guestType: e.target.value as GuestType })
                  }
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                >
                  {GUEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-overline text-dark/50 block mb-1.5">Side</label>
                <select
                  value={editing.side}
                  onChange={(e) => setEditing({ ...editing, side: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none"
                >
                  <option value="">—</option>
                  <option value="BRIDE">Bride</option>
                  <option value="GROOM">Groom</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.plusOneAllowed}
                  onChange={(e) =>
                    setEditing({ ...editing, plusOneAllowed: e.target.checked })
                  }
                  className="accent-sand"
                />
                <span className="text-sm text-dark">Plus one allowed</span>
              </label>

              <div>
                <label className="label-overline text-dark/50 block mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne focus:border-sand focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full text-sm border border-champagne text-dark/60 hover:bg-champagne/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.firstName || !editing.lastName}
                className="flex-1 btn-gold disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
