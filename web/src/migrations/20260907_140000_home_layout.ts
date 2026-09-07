import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_eyebrow" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_title_line1" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_title_line2" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_tagline" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_image_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_cover_id" integer;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_image_alt" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_primary_cta_label" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_secondary_cta_label" varchar;

    CREATE TABLE IF NOT EXISTS "site_settings_page_home_facts" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_page_home_cover_id_media_id_fk"
        FOREIGN KEY ("page_home_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      ALTER TABLE "site_settings_page_home_facts" ADD CONSTRAINT "site_settings_page_home_facts_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "site_settings_page_home_cover_idx" ON "site_settings" USING btree ("page_home_cover_id");
    CREATE INDEX IF NOT EXISTS "site_settings_page_home_facts_order_idx" ON "site_settings_page_home_facts" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_settings_page_home_facts_parent_id_idx" ON "site_settings_page_home_facts" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings_page_home_facts" CASCADE;
    ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_page_home_cover_id_media_id_fk";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_eyebrow";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_title_line1";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_title_line2";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_tagline";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_image_url";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_cover_id";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_image_alt";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_primary_cta_label";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_secondary_cta_label";
  `)
}
