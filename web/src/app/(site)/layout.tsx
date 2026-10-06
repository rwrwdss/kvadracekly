import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Cinzel, Great_Vibes, Manrope, Montserrat } from "next/font/google";
import { CustomerAuthProvider } from "@/components/auth/CustomerAuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { BookingProvider } from "@/components/booking/BookingContext";
import { BookingModal } from "@/components/booking/BookingModal";
import { Header } from "@/components/layout/Header";
import { Footer, StickyBookBar } from "@/components/layout/Footer";
import { CallFab } from "@/components/layout/CallFab";
import { YandexMetrika } from "@/components/analytics/YandexMetrika";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { SmoothScrollAndReveal } from "@/components/ui/SmoothScrollAndReveal";
import { siteOrigin } from "@/lib/seo";
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

/** Заголовок героя: Montserrat Bold; «Вольницей» — Great Vibes. */
const proximaLike = Montserrat({
  variable: "--font-proxima-nova",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "cyrillic"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
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
      className={`${cinzel.variable} ${manrope.variable} ${proximaLike.variable} ${greatVibes.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113439876', 'ym');

    ym(113439876, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/113439876"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <CustomerAuthProvider>
          <BookingProvider>
            <Header />
            <main className="flex-1 main-with-sticky">{children}</main>
            <Footer />
            <StickyBookBar />
            <CookieConsentBanner />
            <CallFab />
            <SmoothScrollAndReveal />
            <AuthModal />
            <BookingModal />
            <Suspense fallback={null}>
              <YandexMetrika />
            </Suspense>
            <Script
              src="https://chatneuron.ru/widget.js"
              strategy="lazyOnload"
              data-client="cmu3sfe2c00013vpdfq1atm6d"
              data-agent="cmu3sfe2l00033vpdt0txfdcg"
              data-variant="card"
              data-api-origin="https://chatneuron.ru"
            />
          </BookingProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
