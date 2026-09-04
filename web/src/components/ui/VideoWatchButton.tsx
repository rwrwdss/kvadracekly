"use client";

import { useEffect, useId, useState } from "react";
import { IconPlay } from "@/components/ui/Icons";

export function VideoWatchButton({
  youtubeId,
  className = "",
}: {
  youtubeId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center gap-2.5 text-sm tracking-[0.12em] uppercase text-ink hover:text-accent transition-colors ${className}`}
        onClick={() => setOpen(true)}
      >
        <span className="grid h-10 w-10 place-items-center border border-[var(--accent-border)] text-accent rounded-full">
          <IconPlay size={18} />
        </span>
        Смотреть видео
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-elevated border border-[var(--border-subtle)] overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
              <h2 id={titleId} className="font-display text-sm tracking-wide uppercase">
                Вольница — видео
              </h2>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center text-mute hover:text-ink"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            {youtubeId ? (
              <div className="aspect-video bg-black">
                <iframe
                  title="Видео Вольница"
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video grid place-items-center p-8 text-center bg-[rgba(0,0,0,0.35)]">
                <div>
                  <p className="section-label">Скоро</p>
                  <p className="mt-3 text-mute text-sm max-w-md mx-auto">
                    Ролик появится после загрузки от заказчика. Пока можно оставить заявку или
                    позвонить.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
