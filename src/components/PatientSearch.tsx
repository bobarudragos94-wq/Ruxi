"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

/** Debounced, search-as-you-type box that syncs the `q` query param. */
export function PatientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      const qs = params.toString();
      router.replace(qs ? `/patients?${qs}` : "/patients", { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <div className="relative">
      <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Caută după nume sau telefon..."
        autoFocus
        className="w-full h-12 pl-12 pr-10 bg-surface-container-lowest border border-outline rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
          aria-label="Șterge căutarea"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
