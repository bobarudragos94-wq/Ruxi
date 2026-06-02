"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export type TabItem = { id: string; label: string; icon?: string; content: React.ReactNode };

/** Reusable horizontal tabs for grouping a page's sections. */
export function Tabs({ items, initial }: { items: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(items.some((t) => t.id === initial) ? (initial as string) : items[0]?.id);
  const current = items.find((t) => t.id === active);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar p-1.5 bg-surface-container rounded-2xl">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all flex items-center gap-2 ${
              active === t.id
                ? "bg-gradient-to-br from-[#0a84ff] to-[#005dac] text-white shadow-md scale-[1.02]"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {t.icon && <Icon name={t.icon} filled={active === t.id} className="!text-lg" />}
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{current?.content}</div>
    </div>
  );
}
