import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Заполняет пустые тексты героя главной и intro галереи текущими значениями с сайта. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_eyebrow" = COALESCE(NULLIF(TRIM("page_home_eyebrow"), ''), 'Премиальный отдых на природе'),
      "page_home_title_line1" = COALESCE(NULLIF(TRIM("page_home_title_line1"), ''), 'Прокат'),
      "page_home_title_line2" = COALESCE(NULLIF(TRIM("page_home_title_line2"), ''), 'квадроциклов'),
      "page_home_tagline" = COALESCE(NULLIF(TRIM("page_home_tagline"), ''), 'Территория свободы'),
      "page_home_image_url" = COALESCE(NULLIF(TRIM("page_home_image_url"), ''), '/images/hero/kvadrocikl-gryaz-usadba-les.jpg'),
      "page_home_image_alt" = COALESCE(
        NULLIF(TRIM("page_home_image_alt"), ''),
        'Всадник на чёрном квадроцикле в грязи на лесной тропе, на фоне освещённая усадьба'
      ),
      "page_home_primary_cta_label" = COALESCE(NULLIF(TRIM("page_home_primary_cta_label"), ''), 'Выбрать маршрут →'),
      "page_home_secondary_cta_label" = COALESCE(NULLIF(TRIM("page_home_secondary_cta_label"), ''), 'Забронировать'),
      "gallery_intro_title" = COALESCE(NULLIF(TRIM("gallery_intro_title"), ''), 'Галерея'),
      "gallery_intro_subtitle" = COALESCE(NULLIF(TRIM("gallery_intro_subtitle"), ''), 'Атмосфера свободы и приключений'),
      "gallery_intro_description" = COALESCE(
        NULLIF(TRIM("gallery_intro_description"), ''),
        'Живые кадры с маршрутов и базы Вольницы. Новые фото можно добавлять через CMS.'
      );

    INSERT INTO "site_settings_page_home_facts" ("_order", "_parent_id", "id", "label")
    SELECT v.ord, s.id, v.fid, v.label
    FROM "site_settings" s
    CROSS JOIN (
      VALUES
        (1, 'home_fact_1', '25–30 мин от Казани'),
        (2, 'home_fact_2', '8 мощных квадроциклов'),
        (3, 'home_fact_3', 'Авторские маршруты'),
        (4, 'home_fact_4', 'Ночные выезды')
    ) AS v(ord, fid, label)
    WHERE NOT EXISTS (
      SELECT 1 FROM "site_settings_page_home_facts" f WHERE f."_parent_id" = s.id
    );
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Данные-заполнители не откатываем
}
