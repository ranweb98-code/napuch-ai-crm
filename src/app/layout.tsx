import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Napuch AI CRM",
  description: "Personal sales pipeline for Napuch AI leads.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Sidebar />
        <BottomNav />
        <main className="min-h-screen px-4 pb-24 pt-6 sm:pl-28 sm:pr-8 sm:pb-10 sm:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
