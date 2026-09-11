import type { Metadata } from "next";
import { Manrope, Bricolage_Grotesque } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Bold, expressive display face for headings — distinct from the Manrope
// body copy so headlines (dashboard greeting, page titles) read as
// intentionally big and a little more characterful than a generic sans.
// Variable font with an optical-size axis, so it picks up extra
// personality (ink-trap-like notches) at the large sizes headings use.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Napuch AI CRM",
  description: "Personal sales pipeline for Napuch AI leads.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <div className="aurora-bg" aria-hidden="true">
          <span className="aurora-blob aurora-blob-1" />
          <span className="aurora-blob aurora-blob-2" />
          <span className="aurora-blob aurora-blob-3" />
        </div>
        <Sidebar />
        <BottomNav />
        <main className="relative z-10 min-h-screen px-4 pb-24 pt-6 sm:pl-28 sm:pr-8 sm:pb-10 sm:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
