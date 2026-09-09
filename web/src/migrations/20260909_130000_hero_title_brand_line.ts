import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Заголовок героя: «Вольницей» вынесена на отдельную строку. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line1" = 'Погрузись в атмосферу',
      "page_home_title_line2" = 'аристократа с';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line1" = 'Погрузись в атмосферу',
      "page_home_title_line2" = 'аристократа с Вольницей.';
  `)
}
