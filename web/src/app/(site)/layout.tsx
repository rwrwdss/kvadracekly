import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import { BookingProvider } from "@/components/booking/BookingContext";
import { BookingModal } from "@/components/booking/BookingModal";
import { Header } from "@/components/layout/Header";
import { Footer, StickyBookBar } from "@/components/layout/Footer";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Вольница — территория свободы",
    template: "%s · Вольница",
  },
  description:
    "Премиальный прокат квадроциклов при усадьбе «Берегиня». Авторские маршруты около 25 минут от Казани.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }, { url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cinzel.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-base text-ink antialiased">
        <BookingProvider>
          <Header />
          <main className="flex-1 main-with-sticky">{children}</main>
          <Footer />
          <StickyBookBar />
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}
