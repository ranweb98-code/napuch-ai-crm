"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "דשבורד", icon: LayoutGrid },
  { href: "/leads", label: "לידים", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 start-0 z-20 hidden w-20 flex-col items-center gap-6 bg-sidebar py-6 sm:flex">
      <Link
        href="/"
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-lg"
        aria-label="Napuch AI CRM"
      >
        נ
      </Link>

      <nav className="flex flex-col items-center gap-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex size-11 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-white/45 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon size={20} strokeWidth={2} />
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <Link
        href="/leads/new"
        title="הוספת ליד"
        className="flex size-11 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Plus size={20} strokeWidth={2} />
      </Link>
    </aside>
  );
}
