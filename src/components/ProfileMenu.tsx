"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";

/** Profile dropdown with account actions, replacing the bare logout button. */
export function ProfileMenu({ user, variant = "sidebar" }: { user: SessionUser; variant?: "sidebar" | "topbar" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = user.name.charAt(0).toUpperCase();

  const menuClass =
    variant === "topbar"
      ? "absolute top-full mt-2 right-0 min-w-[220px]"
      : "absolute bottom-full mb-2 left-0 right-0 sm:min-w-[220px]";

  const menu = (
    <div className={`${menuClass} bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50`}>
      <div className="px-4 py-3 border-b border-outline-variant">
        <p className="font-semibold text-sm truncate">{user.name}</p>
        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
      </div>
      <Link
        href="/account"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors"
      >
        <Icon name="account_circle" className="!text-lg text-on-surface-variant" /> Contul meu
      </Link>
      <Link
        href="/account#password"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors"
      >
        <Icon name="lock_reset" className="!text-lg text-on-surface-variant" /> Schimbă parola
      </Link>
      <Link
        href="/account#preferences"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-container-high transition-colors"
      >
        <Icon name="tune" className="!text-lg text-on-surface-variant" /> Preferințe
      </Link>
      <form action="/api/auth/logout" method="post" className="border-t border-outline-variant">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/40 transition-colors">
          <Icon name="logout" className="!text-lg" /> Deconectare
        </button>
      </form>
    </div>
  );

  if (variant === "topbar") {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold"
          aria-label="Profil"
        >
          {initial}
        </button>
        {open && menu}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-semibold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-on-surface-variant">{ROLE_LABELS[user.role]}</p>
        </div>
        <Icon name="expand_more" className="!text-lg text-on-surface-variant" />
      </button>
      {open && menu}
    </div>
  );
}
