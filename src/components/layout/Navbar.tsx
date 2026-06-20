"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/events", label: "Events" },
  { href: "/travel", label: "Travel" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/registry", label: "Registry" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-white/95 backdrop-blur-sm border-b border-champagne shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        className="container-wedding mx-auto flex items-center justify-between px-6 h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Jhoana & Damariel — home"
        >
          <Heart
            size={14}
            className={`transition-colors fill-current ${
              scrolled || !isHome ? "text-sand" : "text-ivory"
            }`}
          />
          <span
            className={`font-serif text-lg font-light transition-colors ${
              scrolled || !isHome ? "text-dark" : "text-ivory"
            }`}
          >
            J <span className="italic">&amp;</span> D
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`label-overline transition-colors hover:text-sand ${
                  scrolled || !isHome ? "text-dark/70" : "text-ivory/80"
                } ${pathname === link.href ? "text-sand!" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 ${scrolled || !isHome ? "text-dark" : "text-ivory"}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-champagne px-6 py-6">
          <ul className="flex flex-col gap-5 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`label-overline text-dark/70 hover:text-sand transition-colors ${
                    pathname === link.href ? "text-sand!" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
