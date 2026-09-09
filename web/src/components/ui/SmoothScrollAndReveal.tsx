"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { subscribeLenisStopped } from "@/lib/lenisControl";

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Чуть заранее — чтобы анимация успела стартовать
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.05;
}

/**
 * Плавный скролл колёсиком (Lenis) + появление `[data-reveal]` при входе в вьюпорт.
 */
export function SmoothScrollAndReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!reduce) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.05,
        // Модалки / внутренние скролл-контейнеры — не отдавать колесо Lenis
        prevent: (node) =>
          Boolean(
            node.closest("[data-lenis-prevent]") ||
              node.closest(".booking-sheet") ||
              node.closest('[role="dialog"]'),
          ),
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };
      rafId = window.requestAnimationFrame(raf);
    }

    const unsub = subscribeLenisStopped((stopped) => {
      if (!lenis) return;
      if (stopped) lenis.stop();
      else lenis.start();
    });

    const mark = (el: HTMLElement) => {
      if (el.classList.contains("is-revealed")) return;
      el.classList.add("is-revealed");
    };

    if (reduce) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(mark);
      return () => {
        unsub();
        if (rafId) cancelAnimationFrame(rafId);
        lenis?.destroy();
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          mark(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      },
      {
        root: null,
        // Триггерим раньше, не ждём центр экрана
        rootMargin: "0px 0px -4% 0px",
        threshold: [0, 0.05, 0.1],
      },
    );

    const bind = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.classList.contains("is-revealed")) return;
        if (isInViewport(el)) {
          // Уже на экране при загрузке — анимируем сразу
          window.requestAnimationFrame(() => mark(el));
          return;
        }
        io.observe(el);
      });
    };

    bind();
    const t1 = window.setTimeout(bind, 80);
    const t2 = window.setTimeout(bind, 400);

    return () => {
      unsub();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [pathname]);

  return null;
}

export default SmoothScrollAndReveal;
