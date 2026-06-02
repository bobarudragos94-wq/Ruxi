"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";
import { ScrollReset } from "./ScrollReset";
import type { SessionUser } from "@/lib/auth";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const NAV = [
  { href: "/dashboard", label: "Acasă", icon: "dashboard", gradient: "from-[#0a84ff] to-[#005dac]", chip: "bg-[#e3f0ff] text-[#0a6cdc]" },
  { href: "/patients", label: "Pacienți", icon: "person_search", gradient: "from-[#00c389] to-[#00875a]", chip: "bg-[#d6f7ec] text-[#00875a]" },
  { href: "/calendar", label: "Calendar", icon: "calendar_month", gradient: "from-[#7c5cfc] to-[#5b34e0]", chip: "bg-[#ece6ff] text-[#6d4bf6]" },
  { href: "/reminders", label: "Remindere", icon: "notifications_active", gradient: "from-[#ff8a3d] to-[#e06a00]", chip: "bg-[#ffeede] text-[#e06a00]" },
  { href: "/settings", label: "Setări", icon: "settings", gradient: "from-[#ff5d8f] to-[#d11b6b]", chip: "bg-[#ffe3ef] text-[#d11b6b]" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <ScrollReset />

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant py-6 z-30">
        <Link
          href="/dashboard"
          className="px-6 mb-8 flex items-center gap-3 group"
          aria-label="Acasă"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary group-hover:scale-105 transition-transform">
            <Logo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-primary leading-tight">{BRAND_NAME}</h2>
            <p className="text-xs text-on-surface-variant">{BRAND_TAGLINE}</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1.5 px-3 flex-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? `bg-gradient-to-r ${item.gradient} text-white font-semibold shadow-md`
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? "bg-white/20 text-white"
                      : `${item.chip} group-hover:scale-105`
                  }`}
                >
                  <Icon name={item.icon} filled={active} className="!text-xl" />
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 mt-4 border-t border-outline-variant pt-4">
          <ProfileMenu user={user} variant="sidebar" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 md:hidden h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Acasă">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <Logo className="w-5 h-5" />
          </div>
          <span className="font-bold text-primary">{BRAND_NAME}</span>
        </Link>
        <ProfileMenu user={user} variant="topbar" />
      </header>

      {/* Main */}
      <main className="flex-1 md:ml-[260px] pt-14 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-surface-container-lowest border-t border-outline-variant flex justify-around items-center h-16 pb-safe z-40">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 transition-colors ${
                active ? "text-on-surface font-semibold" : "text-on-surface-variant"
              }`}
            >
              <span
                className={`flex items-center justify-center h-8 w-12 rounded-full transition-all ${
                  active ? `bg-gradient-to-br ${item.gradient} text-white shadow-md` : ""
                }`}
              >
                <Icon name={item.icon} filled={active} className="!text-2xl" />
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
