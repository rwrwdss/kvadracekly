import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Заполняет пустые тексты страниц Тарифы/Техника текущими значениями с сайта. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_tariffs_title" = COALESCE(NULLIF(TRIM("page_tariffs_title"), ''), 'Тарифы и услуги'),
      "page_tariffs_subtitle" = COALESCE(NULLIF(TRIM("page_tariffs_subtitle"), ''), 'Выберите формат приключения'),
      "page_tariffs_description" = COALESCE(
        NULLIF(TRIM("page_tariffs_description"), ''),
        'Цена указана за клиентский квадроцикл. В группе резервируется машина инструктора.'
      ),
      "page_tariffs_image_url" = COALESCE(
        NULLIF(TRIM("page_tariffs_image_url"), ''),
        '/images/routes/pamyatnik-obelisk-lesnaya-tropa.jpg'
      ),
      "page_tariffs_image_alt" = COALESCE(
        NULLIF(TRIM("page_tariffs_image_alt"), ''),
        'Вид с квадроцикла на лесную тропу к каменному обелиску на закате'
      ),
      "page_tariffs_section_label" = COALESCE(NULLIF(TRIM("page_tariffs_section_label"), ''), 'Тарифы'),
      "page_tariffs_section_title" = COALESCE(NULLIF(TRIM("page_tariffs_section_title"), ''), 'Тарифы'),
      "page_tariffs_cta_title" = COALESCE(NULLIF(TRIM("page_tariffs_cta_title"), ''), 'Не можете выбрать?'),
      "page_tariffs_cta_text" = COALESCE(
        NULLIF(TRIM("page_tariffs_cta_text"), ''),
        'Подскажем тариф под опыт и состав группы.'
      ),
      "page_fleet_title" = COALESCE(NULLIF(TRIM("page_fleet_title"), ''), 'Наша техника'),
      "page_fleet_subtitle" = COALESCE(
        NULLIF(TRIM("page_fleet_subtitle"), ''),
        'Мощные. Надёжные. Готовые к приключениям'
      ),
      "page_fleet_description" = COALESCE(
        NULLIF(TRIM("page_fleet_description"), ''),
        'На старте 8 квадроциклов: 4 грязевых и 4 прогулочных. Перед каждым выездом — подготовка, ТО и инструктаж.'
      ),
      "page_fleet_image_url" = COALESCE(
        NULLIF(TRIM("page_fleet_image_url"), ''),
        '/images/hero/ryad-kvadrociklov-u-usadby.jpg'
      ),
      "page_fleet_image_alt" = COALESCE(
        NULLIF(TRIM("page_fleet_image_alt"), ''),
        'Ряд грязных квадроциклов на каменистой тропе перед освещённой деревянной усадьбой'
      ),
      "page_fleet_section_label" = COALESCE(NULLIF(TRIM("page_fleet_section_label"), ''), 'Наш парк'),
      "page_fleet_section_title" = COALESCE(NULLIF(TRIM("page_fleet_section_title"), ''), '8 единиц на старте'),
      "page_fleet_cta_title" = COALESCE(NULLIF(TRIM("page_fleet_cta_title"), ''), 'Не знаете, что выбрать?'),
      "page_fleet_cta_text" = COALESCE(
        NULLIF(TRIM("page_fleet_cta_text"), ''),
        'Подберём технику под опыт и маршрут. В группе — машина инструктора.'
      );

    INSERT INTO "site_settings_page_tariffs_chips" ("_order", "_parent_id", "id", "label")
    SELECT v.ord, s.id, v.fid, v.label
    FROM "site_settings" s
    CROSS JOIN (
      VALUES
        (1, 'tariffs_chip_1', 'Инструктор'),
        (2, 'tariffs_chip_2', 'Экипировка'),
        (3, 'tariffs_chip_3', 'Топливо'),
        (4, 'tariffs_chip_4', 'Маршрут')
    ) AS v(ord, fid, label)
    WHERE NOT EXISTS (
      SELECT 1 FROM "site_settings_page_tariffs_chips" c WHERE c."_parent_id" = s.id
    );

    INSERT INTO "site_settings_page_fleet_chips" ("_order", "_parent_id", "id", "label")
    SELECT v.ord, s.id, v.fid, v.label
    FROM "site_settings" s
    CROSS JOIN (
      VALUES
        (1, 'fleet_chip_1', 'Подготовка'),
        (2, 'fleet_chip_2', 'ТО и осмотр'),
        (3, 'fleet_chip_3', 'Экипировка'),
        (4, 'fleet_chip_4', 'Подбор под маршрут')
    ) AS v(ord, fid, label)
    WHERE NOT EXISTS (
      SELECT 1 FROM "site_settings_page_fleet_chips" c WHERE c."_parent_id" = s.id
    );
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // seed-only
}
