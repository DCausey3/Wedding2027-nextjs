export const metadata = {
    title: "Terms and Conditions — Causey/Cárdenas Wedding",
};

export default function TermsPage() {
    return (
        <main
            style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                maxWidth: "720px",
                margin: "60px auto",
                padding: "0 20px",
                lineHeight: 1.7,
                color: "#2b2b2b",
                background: "#fffdf8",
            }}
        >
            <h1 style={{ fontSize: "1.8rem", marginBottom: "0.2em", color: "#5b4636" }}>
                Terms and Conditions — Causey/Cárdenas Wedding
            </h1>
            <p style={{ fontStyle: "italic", color: "#777", marginBottom: "2em" }}>
                Effective date: August 1st 2027
            </p>

            <p>
                By providing your phone number and/or email address through this
                website or verbally to the couple, you agree to receive text messages
                (SMS/MMS/WhatsApp) related to our wedding, including save-the-date
                announcements, invite codes, RSVP reminders, and travel updates.
            </p>

            <p>
                Message and data rates may apply. Message frequency varies
                (approximately 2–5 messages total). You may opt out at any time by
                replying STOP, or reply HELP for assistance.
            </p>

            <p>
                This messaging service is provided by Causey Innovations LLC on
                behalf of the couple and is intended solely for invited wedding
                guests. See our{" "}
                <a href="/privacy" style={{ color: "#8a6d3b" }}>
                    Privacy Policy
                </a>{" "}
                for details on how your information is used.
            </p>

            <footer
                style={{
                    marginTop: "3em",
                    fontSize: "0.9rem",
                    color: "#999",
                    textAlign: "center",
                }}
            >
                Causey &amp; Cárdenas · June 13 , 2027
            </footer>
        </main>
    );
}