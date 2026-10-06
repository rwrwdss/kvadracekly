"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const METRIKA_ID = 113439876;

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const url = `${window.location.pathname}${window.location.search}`;
    window.ym?.(METRIKA_ID, "hit", url, {
      title: document.title,
      referer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
}
