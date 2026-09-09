"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Наблюдает `[data-reveal]` и добавляет `.is-revealed` при появлении в вьюпорте.
 * Работает на всех страницах сайта.
 */
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      nodes.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          io.unobserve(el);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    nodes.forEach((el) => {
      if (el.classList.contains("is-revealed")) return;
      io.observe(el);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}

export default RevealOnScroll;
