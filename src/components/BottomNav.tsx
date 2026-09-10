"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/leads", label: "Leads", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface/95 px-4 py-2 backdrop-blur sm:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary-tint text-primary" : "text-muted",
            )}
          >
            <Icon size={18} strokeWidth={2} />
            {active && label}
          </Link>
        );
      })}
      <Link
        href="/leads/new"
        className="flex size-9 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-white shadow-lg"
        aria-label="Add lead"
      >
        <Plus size={18} strokeWidth={2.5} />
      </Link>
    </nav>
  );
}
