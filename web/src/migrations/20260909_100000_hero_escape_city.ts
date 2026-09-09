import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Герой главной: «Вырвись из города» + эмоциональный подзаголовок. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line1" = 'Вырвись',
      "page_home_title_line2" = 'из города',
      "page_home_tagline" = E'Грязь. Лес. Адреналин.\nИ ни одной городской пробки.';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line1" = 'Прокат',
      "page_home_title_line2" = 'квадроциклов',
      "page_home_tagline" = 'Каждый маршрут открывает следующий уровень сложности';
  `)
}
