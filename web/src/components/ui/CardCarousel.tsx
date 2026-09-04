"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  /** Desktop/tablet grid classes, e.g. "md:grid-cols-2 xl:grid-cols-4" */
  gridClassName?: string;
  className?: string;
  /** Slide width on mobile as CSS, default ~86% */
  mobileSlideClassName?: string;
};

export function CardCarousel({
  children,
  gridClassName = "md:grid-cols-2 xl:grid-cols-4",
  className = "",
  mobileSlideClassName = "w-[min(86vw,22rem)]",
}: Props) {
  const items = Children.toArray(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const syncActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !isMobile) return;
    const slides = Array.from(el.children) as HTMLElement[];
    if (!slides.length) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, [isMobile]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActive();
    el.addEventListener("scroll", syncActive, { passive: true });
    return () => el.removeEventListener("scroll", syncActive);
  }, [syncActive, items.length]);

  function goTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (!slide) return;
    el.scrollTo({ left: slide.offsetLeft - 16, behavior: "smooth" });
  }

  return (
    <div className={className}>
      <div
        ref={scrollerRef}
        className={`hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:overflow-visible md:snap-none md:gap-5 ${gridClassName}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className={`snap-center shrink-0 ${mobileSlideClassName} md:w-auto md:shrink md:snap-align-none md:max-w-none`}
          >
            {child}
          </div>
        ))}
      </div>

      {isMobile && items.length > 1 && (
        <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Слайды">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-label={`Слайд ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                active === i ? "bg-accent" : "bg-white/25"
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
