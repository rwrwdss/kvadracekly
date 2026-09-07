import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_leads_booking_kind" AS ENUM('day', 'night');
    CREATE TYPE "public"."enum_tariffs_season" AS ENUM('atv', 'snow', 'all', 'future', 'off');
    CREATE TYPE "public"."enum_fleet_season" AS ENUM('atv', 'snow', 'all', 'future', 'off');
    CREATE TYPE "public"."enum_site_settings_season_current" AS ENUM('atv', 'snow', 'pause');

    ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "booking_kind" "enum_leads_booking_kind" DEFAULT 'day';
    ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "duration_minutes" numeric;
    ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "contact_prefer" varchar;

    ALTER TABLE "tariffs" ADD COLUMN IF NOT EXISTS "duration_minutes" numeric DEFAULT 60;
    ALTER TABLE "tariffs" ADD COLUMN IF NOT EXISTS "season" "enum_tariffs_season" DEFAULT 'atv';
    ALTER TABLE "tariffs" ADD COLUMN IF NOT EXISTS "active_for_booking" boolean DEFAULT true;

    ALTER TABLE "fleet" ADD COLUMN IF NOT EXISTS "season" "enum_fleet_season" DEFAULT 'atv';
    ALTER TABLE "fleet" ADD COLUMN IF NOT EXISTS "active_for_booking" boolean DEFAULT true;

    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "season_current" "enum_site_settings_season_current" DEFAULT 'atv';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "season_label" varchar DEFAULT 'Сезон квадроциклов';
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "season_banner_text" varchar;

    CREATE INDEX IF NOT EXISTS "leads_booking_kind_idx" ON "leads" USING btree ("booking_kind");

    UPDATE "tariffs" SET "duration_minutes" = 60 WHERE "slug" = 'zelenoe-ozero' AND ("duration_minutes" IS NULL OR "duration_minutes" = 60);
    UPDATE "tariffs" SET "duration_minutes" = 90 WHERE "slug" = 'pamyatnik';
    UPDATE "tariffs" SET "duration_minutes" = 120 WHERE "slug" = 'rodnik';
    UPDATE "tariffs" SET "duration_minutes" = 180 WHERE "slug" = 'ekspediciya';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "leads_booking_kind_idx";

    ALTER TABLE "leads" DROP COLUMN IF EXISTS "booking_kind";
    ALTER TABLE "leads" DROP COLUMN IF EXISTS "duration_minutes";
    ALTER TABLE "leads" DROP COLUMN IF EXISTS "contact_prefer";

    ALTER TABLE "tariffs" DROP COLUMN IF EXISTS "duration_minutes";
    ALTER TABLE "tariffs" DROP COLUMN IF EXISTS "season";
    ALTER TABLE "tariffs" DROP COLUMN IF EXISTS "active_for_booking";

    ALTER TABLE "fleet" DROP COLUMN IF EXISTS "season";
    ALTER TABLE "fleet" DROP COLUMN IF EXISTS "active_for_booking";

    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "season_current";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "season_label";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "season_banner_text";

    DROP TYPE IF EXISTS "public"."enum_leads_booking_kind";
    DROP TYPE IF EXISTS "public"."enum_tariffs_season";
    DROP TYPE IF EXISTS "public"."enum_fleet_season";
    DROP TYPE IF EXISTS "public"."enum_site_settings_season_current";
  `)
}
