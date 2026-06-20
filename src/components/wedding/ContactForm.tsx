"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — wire up to your API / SES later
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="card-wedding flex flex-col items-center text-center gap-4 py-12">
        <CheckCircle size={32} className="text-sand" />
        <h3 className="font-serif text-xl font-light text-dark">Message Sent!</h3>
        <p className="text-sm text-dark/60">
          We&apos;ll get back to you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="contact-name" className="label-overline text-dark/50 block mb-2">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-xl text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="label-overline text-dark/50 block mb-2">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="label-overline text-dark/50 block mb-2">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 rounded-xl text-sm border border-champagne bg-white text-dark placeholder:text-dark/30 focus:border-sand focus:outline-none resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name || !email || !message}
        className="w-full btn-gold disabled:opacity-40"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : "Send Message"}
      </button>
    </form>
  );
}
