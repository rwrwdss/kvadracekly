import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/** Герой: «аристократа с» → «свободы с». */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line2" = 'свободы с'
    WHERE
      "page_home_title_line2" ILIKE '%аристократа%'
      OR NULLIF(TRIM("page_home_title_line2"), '') IS NULL
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET
      "page_home_title_line2" = 'аристократа с'
    WHERE
      "page_home_title_line2" = 'свободы с'
  `)
}
