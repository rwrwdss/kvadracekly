"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";
import { NIGHT_QUEST_TITLE } from "@/lib/booking/progress";

type BookingPrefill = {
  route?: string;
  tariff?: string;
  source?: string;
  productId?: string | number;
  bookingKind?: "day" | "night";
};

type BookingContextValue = {
  open: boolean;
  prefill: BookingPrefill;
  openBooking: (prefill?: BookingPrefill) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function isNightPrefill(next?: BookingPrefill): boolean {
  if (!next) return false;
  if (next.bookingKind === "night") return true;
  const source = String(next.source || "").toLowerCase();
  if (source === "night_quest" || source.includes("night")) return true;
  const route = String(next.route || "").trim();
  return route === NIGHT_QUEST_TITLE || route.toLowerCase().includes("ночн");
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user, loading, openAuth, setPendingAction } = useCustomerAuth();
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<BookingPrefill>({});
  const deferredPrefill = useRef<BookingPrefill | null>(null);
  const hasDeferred = useRef(false);

  const startBooking = useCallback((next?: BookingPrefill) => {
    setPrefill(next ?? {});
    setOpen(true);
  }, []);

  const openBooking = useCallback(
    (next?: BookingPrefill) => {
      if (loading) {
        deferredPrefill.current = next ?? {};
        hasDeferred.current = true;
        return;
      }

      // Ночная заявка — без обязательной авторизации
      if (isNightPrefill(next)) {
        startBooking({ ...next, bookingKind: "night" });
        return;
      }

      if (!user) {
        setPendingAction(() => startBooking(next));
        openAuth({ intent: "booking" });
        return;
      }

      startBooking(next);
    },
    [loading, user, openAuth, setPendingAction, startBooking],
  );

  useEffect(() => {
    if (loading || !hasDeferred.current) return;
    hasDeferred.current = false;
    const next = deferredPrefill.current ?? undefined;
    deferredPrefill.current = null;
    openBooking(next);
  }, [loading, openBooking]);

  const closeBooking = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ open, prefill, openBooking, closeBooking }),
    [open, prefill, openBooking, closeBooking],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
