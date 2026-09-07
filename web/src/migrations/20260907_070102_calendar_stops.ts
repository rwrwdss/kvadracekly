import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_booking_closed_ranges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"note" varchar
  );
  
  ALTER TABLE "site_settings_booking_closed_ranges" ADD CONSTRAINT "site_settings_booking_closed_ranges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_booking_closed_ranges_order_idx" ON "site_settings_booking_closed_ranges" USING btree ("_order");
  CREATE INDEX "site_settings_booking_closed_ranges_parent_id_idx" ON "site_settings_booking_closed_ranges" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_booking_closed_ranges" CASCADE;`)
}
