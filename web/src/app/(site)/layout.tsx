import type { Metadata } from "next";
import { Cinzel, Great_Vibes, Manrope } from "next/font/google";
import { CustomerAuthProvider } from "@/components/auth/CustomerAuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { BookingProvider } from "@/components/booking/BookingContext";
import { BookingModal } from "@/components/booking/BookingModal";
import { Header } from "@/components/layout/Header";
import { Footer, StickyBookBar } from "@/components/layout/Footer";
import { CallFab } from "@/components/layout/CallFab";
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

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Вольница — территория свободы",
    template: "%s · Вольница",
  },
  description:
    "Премиальный прокат квадроциклов при усадьбе «Берегиня». Авторские маршруты около 25 минут от Казани.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${cinzel.variable} ${manrope.variable} ${greatVibes.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink antialiased">
        <CustomerAuthProvider>
          <BookingProvider>
            <Header />
            <main className="flex-1 main-with-sticky">{children}</main>
            <Footer />
            <StickyBookBar />
            <CallFab />
            <AuthModal />
            <BookingModal />
          </BookingProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
