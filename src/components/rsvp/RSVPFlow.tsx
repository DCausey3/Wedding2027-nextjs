"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Search, RefreshCw } from "lucide-react";
import type { RSVPFormData } from "@/types";

type Step = "lookup" | "form" | "done";

const ENTREES = [
  { value: "HERB_ROASTED_CHICKEN", label: "Herb-Roasted Chicken" },
  { value: "FILET_MIGNON", label: "Filet Mignon" },
  { value: "PAN_SEARED_SALMON", label: "Pan-Seared Salmon" },
  { value: "MUSHROOM_RISOTTO", label: "Wild Mushroom Risotto (V)" },
];

const ATTENDANCE_LABELS: Record<string, string> = {
  COLOMBIA: "🇨🇴 Colombia Only (Nov 7)",
  USA: "🇺🇸 USA Only (Dec 12)",
  BOTH: "🎉 Both Weddings",
  DECLINE: "❌ Unable to Attend",
};

export function RSVPFlow() {
  const [step, setStep] = useState<Step>("lookup");
  const [code, setCode] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [guest, setGuest] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Tracks what the guest already had on file when they arrived
  const [previousAttendance, setPreviousAttendance] = useState<string | null>(null);
  const [isReturningGuest, setIsReturningGuest] = useState(false);

  const [form, setForm] = useState<Partial<RSVPFormData>>({
    attendance: null,
    primaryEntree: "",
    flightBooked: false,
    hotelBooked: false,
    shuttleNeeded: false,
  });

  // ── Step 1: Look up invitation code ──────────────────────────────────────
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/rsvp/lookup?code=${encodeURIComponent(code)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Not found");

      setGuest(json.guest);

      // Pre-fill the form if this guest already RSVP'd before
      if (json.existingAttendance) {
        setIsReturningGuest(true);
        setPreviousAttendance(json.existingAttendance);
        setForm((f) => ({
          ...f,
          attendance: json.existingAttendance,
          primaryEntree: json.existingRsvp?.primaryEntree ?? "",
          plusOneName: json.existingRsvp?.plusOneName ?? "",
          plusOneLastName: json.existingRsvp?.plusOneLastName ?? "",
        }));
      }

      setStep("form");
    } catch (err: any) {
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  // ── Step 2: Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id, ...form }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setStep("done");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Done ─────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="card-wedding flex flex-col items-center text-center gap-5 py-14">
        <CheckCircle size={40} className="text-sand" />
        <h2 className="font-serif text-3xl font-light text-dark">
          {isReturningGuest ? "Your RSVP is updated!" : "You're all set!"}
        </h2>
        <p className="text-sm text-dark/60 max-w-xs">
          We&apos;ve saved your RSVP and can&apos;t wait to celebrate with you.
          Look out for updates in your email.
        </p>
      </div>
    );
  }

  // ── Step 1: Code lookup ───────────────────────────────────────────────────
  if (step === "lookup") {
    return (
      <form onSubmit={handleLookup} className="card-wedding space-y-5">
        <div>
          <label htmlFor="invite-code" className="label-overline text-dark/50 block mb-2">
            Invitation Code
          </label>
          <div className="relative">
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. JDWED2026"
              required
              className="w-full px-4 py-3 pr-12 rounded-xl text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none uppercase tracking-widest"
            />
            <Search size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/30" />
          </div>
          {lookupError && (
            <p className="text-red-500 text-xs mt-2" role="alert">{lookupError}</p>
          )}
        </div>
        <button type="submit" disabled={lookupLoading || !code} className="w-full btn-gold disabled:opacity-40">
          {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : "Find My Invitation"}
        </button>
      </form>
    );
  }

  // ── Step 2: RSVP form ─────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-wedding mb-2">
        <p className="label-overline text-sand mb-1">Welcome back</p>
        <p className="font-serif text-2xl font-light text-dark">
          {guest?.firstName} {guest?.lastName}
        </p>
      </div>

      {/* Returning guest banner — shows what's already on file */}
      {isReturningGuest && previousAttendance && (
        <div
          className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ backgroundColor: "#f5ede0", border: "1px solid #d4a574" }}
        >
          <RefreshCw size={15} className="text-sand mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-dark">
              You&apos;re already RSVP&apos;d for: {ATTENDANCE_LABELS[previousAttendance]}
            </p>
            <p className="text-xs text-dark/50 mt-1">
              You can update your response below — it will overwrite what we have on file.
            </p>
          </div>
        </div>
      )}

      {/* Attendance */}
      <div className="card-wedding space-y-3">
        <p className="label-overline text-dark/50 mb-3">Will you attend?</p>
        {(["COLOMBIA", "USA", "BOTH", "DECLINE"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="attendance"
              value={opt}
              checked={form.attendance === opt}
              onChange={() => setForm((f) => ({ ...f, attendance: opt }))}
              className="accent-sand"
            />
            <span className="text-sm text-dark">{ATTENDANCE_LABELS[opt]}</span>
            {previousAttendance === opt && (
              <span className="text-[0.6rem] uppercase tracking-wide text-sand">
                (on file)
              </span>
            )}
          </label>
        ))}
      </div>

      {form.attendance && form.attendance !== "DECLINE" && (
        <>
          {/* Entrée */}
          <div className="card-wedding">
            <p className="label-overline text-dark/50 mb-3">Your Entrée</p>
            <select
              value={form.primaryEntree}
              onChange={(e) => setForm((f) => ({ ...f, primaryEntree: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg text-sm border border-champagne bg-white text-dark focus:border-sand focus:outline-none"
            >
              <option value="">Select an entrée…</option>
              {ENTREES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Plus one */}
          {guest?.plusOneAllowed && (
            <div className="card-wedding space-y-3">
              <p className="label-overline text-dark/50 mb-1">Plus One (optional)</p>
              <input
                type="text"
                placeholder="First name"
                value={form.plusOneName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, plusOneName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last name"
                value={form.plusOneLastName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, plusOneLastName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none"
              />
              {form.plusOneName && (
                <select
                  value={form.plusOneEntree ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, plusOneEntree: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg text-sm border border-champagne bg-white text-dark focus:border-sand focus:outline-none"
                >
                  <option value="">Plus one entrée…</option>
                  {ENTREES.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Travel */}
          <div className="card-wedding space-y-3">
            <p className="label-overline text-dark/50 mb-1">Travel Status</p>
            {[
              { key: "flightBooked" as const, label: "Flight booked" },
              { key: "hotelBooked" as const, label: "Hotel booked" },
              { key: "shuttleNeeded" as const, label: "I need shuttle service" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-sand"
                />
                <span className="text-sm text-dark">{label}</span>
              </label>
            ))}
          </div>

          {/* Notes */}
          <div className="card-wedding">
            <label htmlFor="rsvp-notes" className="label-overline text-dark/50 block mb-2">
              Dietary restrictions / notes (optional)
            </label>
            <textarea
              id="rsvp-notes"
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none resize-none"
              placeholder="Any allergies or requests?"
            />
          </div>
        </>
      )}

      {form.attendance && (
        <button
          type="submit"
          disabled={submitLoading || (form.attendance !== "DECLINE" && !form.primaryEntree)}
          className="w-full btn-gold disabled:opacity-40"
        >
          {submitLoading
            ? <Loader2 size={14} className="animate-spin" />
            : isReturningGuest ? "Update RSVP" : "Submit RSVP"}
        </button>
      )}
    </form>
  );
}
