"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Forces scroll to top on route change (App Router can otherwise restore it). */
export function ScrollReset() {
  const pathname = usePathname();

  // Take over scroll restoration so the browser doesn't re-apply old positions.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
