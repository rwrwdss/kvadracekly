import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** USP героя: уровни маршрутов + поле опыта в заявках. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "page_home_experience_hint" varchar;

    UPDATE "site_settings"
    SET
      "page_home_eyebrow" = 'Не почасовка — уровни маршрутов',
      "page_home_tagline" = 'Каждый маршрут открывает следующий уровень сложности',
      "page_home_primary_cta_label" = 'Смотреть уровни →',
      "page_home_secondary_cta_label" = 'Записаться',
      "page_home_experience_hint" = 'Уже катался? При записи укажите опыт — подберём доступный уровень, а не старт с «Зелёного озера».';

    DELETE FROM "site_settings_page_home_facts";

    INSERT INTO "site_settings_page_home_facts" ("_order", "_parent_id", "id", "label")
    SELECT v.ord, s.id, v.fid, v.label
    FROM "site_settings" s
    CROSS JOIN (
      VALUES
        (1, 'home_fact_usp_1', 'Не часы — уровни 1→4'),
        (2, 'home_fact_usp_2', 'Новичок → Зелёное озеро'),
        (3, 'home_fact_usp_3', 'Опыт — доступ к сложным'),
        (4, 'home_fact_usp_4', '25–30 мин от Казани')
    ) AS v(ord, fid, label);

    DO $$ BEGIN
      CREATE TYPE "public"."enum_leads_rider_experience" AS ENUM('novice', 'experienced', 'regular');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "rider_experience" "enum_leads_rider_experience";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "leads" DROP COLUMN IF EXISTS "rider_experience";
    DROP TYPE IF EXISTS "public"."enum_leads_rider_experience";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "page_home_experience_hint";
  `)
}
