import type { Metadata } from "next";

export const metadata: Metadata = { title: "Личный кабинет" };

export default function LkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
