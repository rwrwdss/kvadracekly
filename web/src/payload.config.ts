import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ru } from "@payloadcms/translations/languages/ru";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Gallery } from "./collections/Gallery";
import { Products } from "./collections/Products";
import { Leads } from "./collections/Leads";
import { Customers } from "./collections/Customers";
import { Notifications } from "./collections/Notifications";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: "· Вольница CRM",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: ["./admin/components/RoleTheme#RoleTheme"],
      beforeDashboard: ["./admin/components/CrmHome#CrmHome"],
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
      },
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: "ru",
  },
  collections: [Users, Media, Gallery, Products, Customers, Leads, Notifications],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "volnitsa-dev-secret-change-me",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || `file:${path.resolve(dirname, "../data/volnitsa.db")}`,
    },
  }),
  sharp,
});
