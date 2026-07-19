"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // "/" is the guest login screen — no nav/footer to show yet.
    const isLoginPage = pathname === "/";

    return (
        <>
            {!isLoginPage && <Navbar />}
            <main id="main-content">{children}</main>
            {!isLoginPage && <Footer />}
        </>
    );
}