import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Герой: премиальный eyebrow + новый заголовок/подзаголовок. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_eyebrow" = 'Премиальный отдых на природе',
      "page_home_title_line1" = 'Погрузись в атмосферу',
      "page_home_title_line2" = 'аристократа с Вольницей.',
      "page_home_tagline" = E'Вольница — место, где история усадеб встречается\nс духом настоящего приключения.';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_eyebrow" = 'Не почасовка — уровни маршрутов',
      "page_home_title_line1" = 'Вырвись',
      "page_home_title_line2" = 'из города',
      "page_home_tagline" = E'Грязь. Лес. Адреналин.\nИ ни одной городской пробки.';
  `)
}
