import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-vercel-postgres";

/** Hero video для первого экрана главной (upload + запасной путь). */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_hero_video_url" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_hero_video_id" integer;

    DO $$ BEGIN
      ALTER TABLE "site_settings"
        ADD CONSTRAINT "site_settings_page_home_hero_video_id_media_id_fk"
        FOREIGN KEY ("page_home_hero_video_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_settings_page_home_hero_video_idx"
      ON "site_settings" USING btree ("page_home_hero_video_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_page_home_hero_video_id_media_id_fk";
    DROP INDEX IF EXISTS "site_settings_page_home_hero_video_idx";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_hero_video_url";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_hero_video_id";
  `);
}
