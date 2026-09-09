import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { vercelPostgresAdapter } from "@payloadcms/db-vercel-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ru } from "@payloadcms/translations/languages/ru";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Gallery } from "./collections/Gallery";
import { Products } from "./collections/Products";
import { Tariffs } from "./collections/Tariffs";
import { Fleet } from "./collections/Fleet";
import { Leads } from "./collections/Leads";
import { Customers } from "./collections/Customers";
import { Notifications } from "./collections/Notifications";
import { GiftCertificates } from "./collections/GiftCertificates";
import { SiteSettings } from "./globals/SiteSettings";
import { migrations } from "./migrations";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseUrlRaw = process.env.DATABASE_URL?.trim();
if (!databaseUrlRaw) {
  throw new Error(
    "DATABASE_URL is required. Use a Neon/Postgres connection string (pooled, sslmode=require).",
  );
}
if (/^file:/i.test(databaseUrlRaw) || /sqlite/i.test(databaseUrlRaw)) {
  throw new Error(
    "DATABASE_URL must be PostgreSQL (Neon). SQLite / file: URLs are not supported in this project.",
  );
}

/** Neon: убираем channel_binding (висит на serverless) и оставляем sslmode=require. */
function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url.replace(/^postgresql:/i, "http:").replace(/^postgres:/i, "http:"));
    parsed.searchParams.delete("channel_binding");
    if (!parsed.searchParams.get("sslmode")) parsed.searchParams.set("sslmode", "require");
    parsed.searchParams.delete("uselibpqcompat");
    const user = encodeURIComponent(decodeURIComponent(parsed.username));
    const pass = encodeURIComponent(decodeURIComponent(parsed.password));
    return `postgresql://${user}:${pass}@${parsed.host}${parsed.pathname}?${parsed.searchParams.toString()}`;
  } catch {
    return url;
  }
}

const databaseUrl = normalizeDatabaseUrl(databaseUrlRaw);

const payloadSecret = process.env.PAYLOAD_SECRET?.trim();
if (!payloadSecret) {
  throw new Error("PAYLOAD_SECRET is required.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: " · Вольница CRM",
      icons: {
        icon: [
          { url: "/favicon.ico", sizes: "any" },
          { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        ],
        apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
        shortcut: "/favicon.ico",
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: ["./admin/components/RoleTheme#RoleTheme"],
      beforeDashboard: ["./admin/components/CrmHome#CrmHome"],
      afterNavLinks: [
        "./admin/components/CalendarNav#CalendarNav",
        "./admin/components/NewLeadNav#NewLeadNav",
      ],
      logout: {
        Button: "./admin/components/ManagerLogout#ManagerLogout",
      },
      graphics: {
        Logo: "./admin/components/Logo#Logo",
        Icon: "./admin/components/Icon#Icon",
      },
      views: {
        account: {
          Component: "./admin/components/ManagerAccountView#ManagerAccountView",
        },
        calendarBookings: {
          Component: "./admin/components/CalendarBookingsView#CalendarBookingsView",
          path: "/calendar",
          exact: true,
          meta: { title: "Календарь · Записи" },
        },
        calendarStops: {
          Component: "./admin/components/CalendarStopsView#CalendarStopsView",
          path: "/calendar/stops",
          exact: true,
          meta: { title: "Календарь · Остановка" },
        },
        newLead: {
          Component: "./admin/components/NewLeadView#NewLeadView",
          path: "/leads/new",
          exact: true,
          meta: { title: "Новая заявка" },
        },
        giftCertificates: {
          Component: "./admin/components/GiftCertificatesView#GiftCertificatesView",
          path: "/gift-certificates",
          exact: true,
          meta: { title: "Подарочный сертификат" },
        },
      },
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: "ru",
  },
  collections: [
    Users,
    Media,
    Gallery,
    Products,
    Tariffs,
    Fleet,
    Customers,
    Leads,
    Notifications,
    GiftCertificates,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // WebSocket-пул Neon — надёжнее TCP node-pg с Vercel serverless.
  db: vercelPostgresAdapter({
    pool: {
      connectionString: databaseUrl,
      max: 1,
      idleTimeoutMillis: 10_000,
    },
    // Только явный local-dev push. Seed/migrate/CI/Vercel — через migrations.
    push: process.env.NODE_ENV === "development" && process.env.VERCEL !== "1",
    migrationDir: path.resolve(dirname, "migrations"),
    prodMigrations: migrations,
  }),
  sharp,
});
