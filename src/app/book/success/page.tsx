"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui";

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
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-6">
        <Icon name="check_circle" filled className="!text-4xl" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-3">Programare confirmată!</h1>
      <Card className="p-6 max-w-md w-full">
        <p className="text-on-surface-variant">
          {when ? (
            <>Programarea ta pentru <span className="font-semibold text-on-surface">{when}</span> a fost înregistrată.</>
          ) : (
            "Programarea ta a fost înregistrată."
          )}
        </p>
        <p className="text-sm text-on-surface-variant mt-3">
          Te așteptăm la cabinet. Pentru modificări, contactează-ne telefonic.
        </p>
      </Card>
      <Link href="/book" className="mt-6 text-primary font-medium">
        Programare nouă
      </Link>
    </div>
  );
}
