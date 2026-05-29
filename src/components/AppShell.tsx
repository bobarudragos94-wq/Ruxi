"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";

const NAV = [
  { href: "/dashboard", label: "Acasă", icon: "dashboard" },
  { href: "/patients", label: "Pacienți", icon: "person_search" },
  { href: "/calendar", label: "Calendar", icon: "calendar_month" },
  { href: "/reminders", label: "Remindere", icon: "notifications_active" },
  { href: "/settings", label: "Setări", icon: "settings" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant py-6 z-30">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Icon name="dentistry" filled />
          </div>
          <div>
            <h2 className="font-bold text-primary leading-tight">Cabinet</h2>
            <p className="text-xs text-on-surface-variant">Stomatologie</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? "bg-primary-fixed text-on-primary-fixed font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Icon name={item.icon} filled={active} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 mt-4 border-t border-outline-variant pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-on-surface-variant">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post" className="mt-3">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-error transition-colors">
              <Icon name="logout" className="!text-lg" />
              Deconectare
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 md:hidden h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <Icon name="dentistry" filled className="!text-lg" />
          </div>
          <span className="font-bold text-primary">Cabinet</span>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="p-2 text-on-surface-variant rounded-full hover:bg-surface-container">
            <Icon name="logout" />
          </button>
        </form>
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
              className={`flex flex-col items-center justify-center gap-0.5 px-2 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon name={item.icon} filled={active} className="!text-2xl" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
