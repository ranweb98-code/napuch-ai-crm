import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

// One Hebrew-supporting variable font for both body and display use
// (Manrope/Bricolage Grotesque have no Hebrew glyphs at all, so a UI in
// Hebrew needs a face that does). Body copy uses normal/medium weight;
// headings dial it up to 800/900 via Tailwind's font-extrabold/font-black
// for the "very bold" look, off the same variable file.
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "Napuch AI CRM",
  description: "צינור מכירות אישי למעקב אחרי לידים של Napuch AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="aurora-bg" aria-hidden="true">
          <span className="aurora-blob aurora-blob-1" />
          <span className="aurora-blob aurora-blob-2" />
          <span className="aurora-blob aurora-blob-3" />
        </div>
        <Sidebar />
        <BottomNav />
        <main className="relative z-10 min-h-screen px-4 pb-24 pt-6 sm:ps-28 sm:pe-8 sm:pb-10 sm:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
