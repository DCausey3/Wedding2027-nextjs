import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";


// Server components can handle metadata perfectly
export const metadata: Metadata = {
    title: "Home | Jhoana & Damariel Wedding 2027",
};

export default function Page() {
    return (
        <div className="w-full min-h-screen">
            <HomePage />
        </div>
    );
}