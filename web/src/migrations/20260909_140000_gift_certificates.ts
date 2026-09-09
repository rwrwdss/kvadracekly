import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-vercel-postgres";

/** Таблица подарочных сертификатов. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "gift_certificates" (
      "id" serial PRIMARY KEY NOT NULL,
      "first_name" varchar NOT NULL,
      "last_name" varchar NOT NULL,
      "full_name" varchar,
      "slug" varchar NOT NULL,
      "route_slug" varchar NOT NULL,
      "route_title" varchar NOT NULL,
      "status" varchar DEFAULT 'active' NOT NULL,
      "valid_until" timestamp(3) with time zone,
      "created_by_id" integer,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "gift_certificates"
        ADD CONSTRAINT "gift_certificates_created_by_id_users_id_fk"
        FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "gift_certificates_slug_idx"
      ON "gift_certificates" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "gift_certificates_created_by_id_idx"
      ON "gift_certificates" USING btree ("created_by_id");
    CREATE INDEX IF NOT EXISTS "gift_certificates_updated_at_idx"
      ON "gift_certificates" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "gift_certificates_created_at_idx"
      ON "gift_certificates" USING btree ("created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "gift_certificates" CASCADE;
  `);
}
