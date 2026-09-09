"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Плавный скролл колёсиком + появление `[data-reveal]` при входе в вьюпорт.
 */
export function SmoothScrollAndReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!reduce) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.1,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    }

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.classList.add("is-revealed");
      });
    };

    if (reduce) {
      revealAll();
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        lenis?.destroy();
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Двойной кадр — чтобы transition/animation точно стартовали
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              el.classList.add("is-revealed");
            });
          });
          io.unobserve(el);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08,
      },
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.classList.contains("is-revealed")) return;
        io.observe(el);
      });
    };

    // После гидрации / смены маршрута
    observe();
    const t = window.setTimeout(observe, 120);

    return () => {
      window.clearTimeout(t);
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}

export default SmoothScrollAndReveal;
