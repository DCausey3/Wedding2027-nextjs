import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "../components/providers/SupabaseProvider";
// 1. Import your AuthProvider (adjust the path if it lives somewhere else)
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: {
        default: "Jhoana & Damariel | Wedding 2026",
        template: "%s | Jhoana & Damariel",
    },
    description:
        "Join us as we celebrate our love — two weddings, two countries, one love story. Colombia · November 2026 | USA · December 2026",
    openGraph: {
        type: "website",
        siteName: "Jhoana & Damariel Wedding",
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <SupabaseProvider>
            {/* 2. Nest AuthProvider inside SupabaseProvider so auth code can access Supabase if needed */}
            <AuthProvider>
                {children}
            </AuthProvider>

            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        fontFamily: "var(--font-inter)",
                        borderRadius: "12px",
                    },
                }}
            />
        </SupabaseProvider>
        </body>
        </html>
    );
}