"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";
import { useLanguage } from "../providers/LanguageProvider";

// Supabase can hand these back as real booleans or "true"/"false" strings
// depending on the column — normalize defensively, same as the homepage.
function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

type NavLink = { href: string; label: string };

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { guest, loaded } = useAuth();
    const { lang, setLang } = useLanguage();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isHome = pathname === "/home";
    const locked = !loaded || !guest;

    const attendingColombia = isTruthy((guest as any)?.stdAttendingColombia);
    const attendingFlorida = isTruthy((guest as any)?.stdAttendingFlorida);

    // Insert Colombia/Texas right after "Our Story" — only for weddings this
    // guest actually RSVP'd to attend. Shows both, one, or neither.
    const navLinks: NavLink[] = [
        { href: "/home", label: lang === "es" ? "Inicio" : "Home" },
        { href: "/our-story", label: lang === "es" ? "Nuestra historia" : "Our Story" },
        ...(attendingColombia ? [{ href: "/colombia", label: "Colombia" }] : []),
        ...(attendingFlorida ? [{ href: "/florida", label: "Florida" }] : []),
        { href: "/bridalParty", label: lang === "es" ? "Cortejo" : "Wedding Party" },
        { href: "/rsvp", label: "RSVP" },
        { href: "/registry", label: lang === "es" ? "Regalos" : "Registry" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: lang === "es" ? "Contacto" : "Contact" },
    ];

    const languageToggle = (
        <div className="flex items-center gap-1" role="group" aria-label={lang === "es" ? "Idioma" : "Language"}>
            {(["en", "es"] as const).map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => setLang(option)}
                    aria-pressed={lang === option}
                    className={`px-2 py-1 text-[0.65rem] font-semibold tracking-wider rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        lang === option
                            ? scrolled || !isHome ? "bg-sand text-dark" : "bg-white/20 text-white"
                            : scrolled || !isHome ? "text-dark/60 hover:text-dark" : "text-white/70 hover:text-white"
                    }`}
                >
                    {option.toUpperCase()}
                </button>
            ))}
        </div>
    );

    const handleLockedClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(false);
        router.push("/");
    };

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
                aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}
            >
                {/* Logo — always goes to /home */}
                <Link
                    href={locked ? "/" : "/home"}
                    onClick={locked ? handleLockedClick : undefined}
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
                <ul className="hidden lg:flex items-center gap-4 list-none">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={locked ? "/" : link.href}
                                onClick={locked ? handleLockedClick : undefined}
                                aria-disabled={locked}
                                title={locked ? lang === "es" ? "Inicia sesión para acceder a esta página" : "Log in to access this page" : undefined}
                                className={`label-overline transition-colors hover:text-sand ${
                                    scrolled || !isHome ? "text-dark/70" : "text-ivory/80"
                                } ${pathname === link.href ? "text-sand!" : ""} ${
                                    locked ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="hidden lg:block">{languageToggle}</div>

                {/* Mobile hamburger */}
                <div className="flex items-center gap-2 lg:hidden">
                    {languageToggle}
                <button
                    className={`p-2 ${scrolled || !isHome ? "text-dark" : "text-ivory"}`}
                    onClick={() => setOpen(!open)}
                    aria-label={open ? lang === "es" ? "Cerrar menú" : "Close menu" : lang === "es" ? "Abrir menú" : "Open menu"}
                    aria-expanded={open}
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
                </div>
            </nav>

            {/* Mobile drawer */}
            {open && (
                <div className="lg:hidden bg-white border-t border-champagne px-6 py-6">
                    <ul className="flex flex-col gap-5 list-none">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={locked ? "/" : link.href}
                                    className={`label-overline text-dark/70 hover:text-sand transition-colors ${
                                        pathname === link.href ? "text-sand!" : ""
                                    } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={(e) => {
                                        if (locked) {
                                            handleLockedClick(e);
                                        } else {
                                            setOpen(false);
                                        }
                                    }}
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