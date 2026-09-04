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
import { buildProgress, type ProgressInfo } from "@/lib/booking/progress";

export type CustomerAuthUser = {
  phone: string;
  name: string;
  customerId: number | string;
  progress: ProgressInfo;
  known: boolean;
};

type CustomerAuthContextValue = {
  user: CustomerAuthUser | null;
  loading: boolean;
  authOpen: boolean;
  openAuth: (opts?: { intent?: string }) => void;
  closeAuth: () => void;
  login: (input: { name: string; phone: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Выполнить после успешного входа (например открыть бронь). */
  consumePendingAction: () => void;
  setPendingAction: (fn: (() => void) | null) => void;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/auth", { credentials: "include" });
      const data = await res.json();
      if (!data.authenticated) {
        setUser(null);
        return;
      }
      setUser({
        phone: data.phone,
        name: data.name,
        customerId: data.customerId,
        progress: data.progress || buildProgress(0),
        known: Boolean(data.known),
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setPendingAction = useCallback((fn: (() => void) | null) => {
    pendingRef.current = fn;
  }, []);

  const consumePendingAction = useCallback(() => {
    const fn = pendingRef.current;
    pendingRef.current = null;
    fn?.();
  }, []);

  const openAuth = useCallback((_opts?: { intent?: string }) => {
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
    pendingRef.current = null;
  }, []);

  const login = useCallback(
    async (input: { name: string; phone: string }) => {
      try {
        const res = await fetch("/api/customer/auth", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false as const, error: data.error || "Ошибка входа" };
        setUser({
          phone: data.phone,
          name: data.name,
          customerId: data.customerId,
          progress: data.progress || buildProgress(0),
          known: Boolean(data.known),
        });
        setAuthOpen(false);
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "Нет связи с сервером" };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/customer/auth", { method: "DELETE", credentials: "include" });
    setUser(null);
    pendingRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authOpen,
      openAuth,
      closeAuth,
      login,
      logout,
      refresh,
      consumePendingAction,
      setPendingAction,
    }),
    [
      user,
      loading,
      authOpen,
      openAuth,
      closeAuth,
      login,
      logout,
      refresh,
      consumePendingAction,
      setPendingAction,
    ],
  );

  return (
    <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
