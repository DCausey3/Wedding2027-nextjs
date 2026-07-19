"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { useAuth } from "../../app/context/AuthContext";

// Supabase can hand these back as real booleans or "true"/"false" strings
// depending on the column — normalize defensively, same as the homepage.
function isTruthy(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
}

type NavLink = { href: string; label: string };

const BASE_LINKS: NavLink[] = [
    { href: "/home", label: "Home" },
    { href: "/our-story", label: "Our Story" },
    { href: "/bridalParty", label: "Meet Bridal Party" },
    { href: "/rsvp", label: "RSVP" },
    { href: "/registry", label: "Registry" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { guest, loaded } = useAuth();

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
        ...BASE_LINKS.slice(0, 2), // Home, Our Story
        ...(attendingColombia ? [{ href: "/colombia", label: "Colombia" }] : []),
        ...(attendingFlorida ? [{ href: "/texas", label: "Texas" }] : []),
        ...BASE_LINKS.slice(2), // Events, Travel, RSVP, Registry, FAQ, Contact
    ];

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
                aria-label="Main navigation"
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
                <ul className="hidden md:flex items-center gap-8 list-none">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={locked ? "/" : link.href}
                                onClick={locked ? handleLockedClick : undefined}
                                aria-disabled={locked}
                                title={locked ? "Log in to access this page" : undefined}
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