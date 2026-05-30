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
      <div className="flex gap-1 border-b border-outline-variant overflow-x-auto no-scrollbar">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
              active === t.id
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t.icon && <Icon name={t.icon} className="!text-lg" />}
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{current?.content}</div>
    </div>
  );
}
