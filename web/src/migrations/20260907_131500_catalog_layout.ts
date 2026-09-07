import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_subtitle" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_description" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_image_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_cover_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_image_alt" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_section_label" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_section_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_cta_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_tariffs_cta_text" varchar;

    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_subtitle" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_description" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_image_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_cover_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_image_alt" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_section_label" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_section_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_cta_title" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_fleet_cta_text" varchar;

    CREATE TABLE IF NOT EXISTS "site_settings_page_tariffs_chips" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "site_settings_page_fleet_chips" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_page_tariffs_cover_id_media_id_fk"
        FOREIGN KEY ("page_tariffs_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_page_fleet_cover_id_media_id_fk"
        FOREIGN KEY ("page_fleet_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_settings_page_tariffs_chips" ADD CONSTRAINT "site_settings_page_tariffs_chips_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_settings_page_fleet_chips" ADD CONSTRAINT "site_settings_page_fleet_chips_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "site_settings_page_tariffs_cover_idx" ON "site_settings" USING btree ("page_tariffs_cover_id");
    CREATE INDEX IF NOT EXISTS "site_settings_page_fleet_cover_idx" ON "site_settings" USING btree ("page_fleet_cover_id");
    CREATE INDEX IF NOT EXISTS "site_settings_page_tariffs_chips_order_idx" ON "site_settings_page_tariffs_chips" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_page_tariffs_chips_parent_id_idx" ON "site_settings_page_tariffs_chips" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_settings_page_fleet_chips_order_idx" ON "site_settings_page_fleet_chips" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_page_fleet_chips_parent_id_idx" ON "site_settings_page_fleet_chips" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_page_tariffs_chips" CASCADE;
    DROP TABLE IF EXISTS "site_settings_page_fleet_chips" CASCADE;

    ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_page_tariffs_cover_id_media_id_fk";
    ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_page_fleet_cover_id_media_id_fk";

    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_subtitle";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_description";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_image_url";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_cover_id";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_image_alt";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_section_label";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_section_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_cta_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_tariffs_cta_text";

    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_subtitle";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_description";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_image_url";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_cover_id";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_image_alt";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_section_label";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_section_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_cta_title";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_fleet_cta_text";
  `)
}
