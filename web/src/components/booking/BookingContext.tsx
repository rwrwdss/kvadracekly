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

type BookingPrefill = {
  route?: string;
  tariff?: string;
  source?: string;
  productId?: string | number;
};

type BookingContextValue = {
  open: boolean;
  prefill: BookingPrefill;
  openBooking: (prefill?: BookingPrefill) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

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

      if (!user) {
        setPendingAction(() => startBooking(next));
        openAuth({ intent: "booking" });
        return;
      }

      startBooking(next);
    },
    [loading, user, openAuth, setPendingAction, startBooking],
  );

  // После загрузки сессии — продолжить отложенную запись
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
