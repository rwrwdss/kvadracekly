"use client";

import { useBooking } from "@/components/booking/BookingContext";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  prefill?: {
    route?: string;
    tariff?: string;
    source?: string;
    productId?: string | number;
    bookingKind?: "day" | "night";
  };
  type?: "button" | "submit";
};

export function BookButton({
  children,
  variant = "primary",
  className = "",
  prefill,
  type = "button",
}: Props) {
  const { openBooking } = useBooking();
  return (
    <button
      type={type}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}
      onClick={() => openBooking(prefill)}
    >
      {children}
    </button>
  );
}
