"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function BookSuccessPage() {
  const [when, setWhen] = useState("");

  useEffect(() => {
    const iso = sessionStorage.getItem("booking_confirmed");
    if (iso) {
      const d = new Date(iso);
      setWhen(
        d.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }) +
          " la " +
          d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })
      );
    }
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-10 max-w-md mx-auto">
      <div className="relative mb-7">
        <span className="absolute inset-0 rounded-full bg-[#00c389]/40 animate-pulse-ring" aria-hidden />
        <div className="relative w-24 h-24 bg-gradient-to-br from-[#00c389] to-[#00875a] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#00c389]/30 animate-pop-check">
          <Icon name="check" className="!text-5xl" />
        </div>
      </div>

      <h1 className="animate-fade-up delay-150 font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        Programare confirmată!
      </h1>

      <div className="animate-fade-up delay-225 w-full rounded-3xl p-[1.5px] bg-gradient-to-br from-[#00c389]/40 via-outline-variant to-[#0a84ff]/40 shadow-lg">
        <div className="glass rounded-[calc(1.5rem-1.5px)] p-6">
          {when ? (
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                <Icon name="event_available" filled />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wide">Te așteptăm</p>
                <p className="font-bold capitalize">{when}</p>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant">Programarea ta a fost înregistrată.</p>
          )}
          <p className="text-sm text-on-surface-variant mt-4 pt-4 border-t border-outline-variant/60">
            Te așteptăm la cabinet. Pentru modificări, contactează-ne telefonic.
          </p>
        </div>
      </div>

      <Link
        href="/book"
        className="animate-fade-up delay-300 mt-7 inline-flex items-center gap-1.5 text-primary font-semibold hover:gap-2.5 transition-all"
      >
        <Icon name="add" className="!text-xl" />
        Programare nouă
      </Link>
    </div>
  );
}
