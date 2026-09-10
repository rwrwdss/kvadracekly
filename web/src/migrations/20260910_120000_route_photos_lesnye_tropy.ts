import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-vercel-postgres";

/** Новые фото маршрутов + тариф «Лесные тропы». */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "tariffs" SET
      "image_url" = '/images/routes/zelenoe-ozero.jpg',
      "updated_at" = now()
    WHERE "slug" = 'zelenoe-ozero';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/pamyatnik.jpg',
      "updated_at" = now()
    WHERE "slug" = 'pamyatnik';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/rodnik.jpg',
      "updated_at" = now()
    WHERE "slug" = 'rodnik';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/ekspediciya.jpg',
      "updated_at" = now()
    WHERE "slug" = 'ekspediciya';

    INSERT INTO "tariffs" (
      "title",
      "slug",
      "badge",
      "price",
      "duration",
      "duration_minutes",
      "distance",
      "difficulty",
      "difficulty_label",
      "audience",
      "description",
      "progress_order",
      "image_url",
      "image_alt",
      "sort_order",
      "published",
      "season",
      "active_for_booking",
      "updated_at",
      "created_at"
    )
    SELECT
      'Лесные тропы',
      'lesnye-tropy',
      'Новое!',
      9000,
      '1–2 ч',
      90,
      '15–20 км',
      'medium',
      'Средний',
      'После базового опыта',
      'Новый маршрут по лесным тропам: есть участки с грязью.',
      5,
      '/images/routes/lesnye-tropy.jpg',
      'Вид с квадроцикла по грязной тропе в берёзовом лесу, впереди другой райдер',
      5,
      true,
      'atv',
      true,
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM "tariffs" WHERE "slug" = 'lesnye-tropy'
    );
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "tariffs" WHERE "slug" = 'lesnye-tropy';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/ozero-sosny-zakat.jpg',
      "updated_at" = now()
    WHERE "slug" = 'zelenoe-ozero';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/pamyatnik-obelisk-lesnaya-tropa.jpg',
      "updated_at" = now()
    WHERE "slug" = 'pamyatnik';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/rodnik-moh-solnechnye-luchi.jpg',
      "updated_at" = now()
    WHERE "slug" = 'rodnik';

    UPDATE "tariffs" SET
      "image_url" = '/images/routes/ekspediciya-gryaz-krutoj-podem.jpg',
      "updated_at" = now()
    WHERE "slug" = 'ekspediciya';
  `);
}
