"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type GuestType = 'colombia-only' | 'florida-only' | 'both' | 'choose-one' | 'bridal-party';

export interface GuestData {
    name?: string;
    type: GuestType;
    rsvpComplete: boolean;
    plusOne: boolean;
    party: string[];
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    plusOneAllowed: boolean;
    attendance?: string;
    plusOneName?: string;
    plusOneLastName?: string;
}

interface AuthContextValue {
    guest: GuestData | null;
    setGuest: (guest: GuestData | null) => void;
    isAdmin: boolean;
    setIsAdmin: (v: boolean) => void;
    loaded: boolean; // true once we've checked sessionStorage on mount
}

export const AuthContext = createContext<AuthContextValue>({
    guest: null,
    setGuest: () => {},
    isAdmin: false,
    setIsAdmin: () => {},
    loaded: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [guest, setGuestState] = useState<GuestData | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Rehydrate guest session on mount (e.g. after a page refresh) so
    // Navbar/Footer/pages don't briefly think the guest is logged out.
    useEffect(() => {
        const stored = sessionStorage.getItem('guest');
        if (stored) {
            try {
                setGuestState(JSON.parse(stored));
            } catch {
                // ignore malformed storage
            }
        }
        setLoaded(true);
    }, []);

    // Keep sessionStorage in sync whenever guest changes via setGuest,
    // so login page's manual sessionStorage.setItem becomes redundant
    // (safe to leave in place, this just guards other callers).
    const setGuest = (g: GuestData | null) => {
        setGuestState(g);
        if (g) {
            sessionStorage.setItem('guest', JSON.stringify(g));
        } else {
            sessionStorage.removeItem('guest');
        }
    };

    return (
        <AuthContext.Provider value={{ guest, setGuest, isAdmin, setIsAdmin, loaded }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}