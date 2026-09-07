import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tariffs_difficulty" AS ENUM('easy', 'medium', 'hard');
  CREATE TABLE "tariffs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"badge" varchar,
  	"price" numeric NOT NULL,
  	"price_note" varchar,
  	"duration" varchar NOT NULL,
  	"distance" varchar NOT NULL,
  	"difficulty" "enum_tariffs_difficulty" DEFAULT 'easy' NOT NULL,
  	"difficulty_label" varchar NOT NULL,
  	"audience" varchar,
  	"description" varchar NOT NULL,
  	"progress_order" numeric DEFAULT 1,
  	"image_url" varchar,
  	"cover_id" integer,
  	"image_alt" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fleet" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"color" varchar NOT NULL,
  	"count" numeric DEFAULT 1 NOT NULL,
  	"seats" numeric DEFAULT 2 NOT NULL,
  	"drive" varchar DEFAULT '4×4' NOT NULL,
  	"image_url" varchar,
  	"cover_id" integer,
  	"image_alt" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tariffs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "fleet_id" integer;
  ALTER TABLE "tariffs" ADD CONSTRAINT "tariffs_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fleet" ADD CONSTRAINT "fleet_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "tariffs_slug_idx" ON "tariffs" USING btree ("slug");
  CREATE INDEX "tariffs_cover_idx" ON "tariffs" USING btree ("cover_id");
  CREATE INDEX "tariffs_updated_at_idx" ON "tariffs" USING btree ("updated_at");
  CREATE INDEX "tariffs_created_at_idx" ON "tariffs" USING btree ("created_at");
  CREATE UNIQUE INDEX "fleet_slug_idx" ON "fleet" USING btree ("slug");
  CREATE INDEX "fleet_cover_idx" ON "fleet" USING btree ("cover_id");
  CREATE INDEX "fleet_updated_at_idx" ON "fleet" USING btree ("updated_at");
  CREATE INDEX "fleet_created_at_idx" ON "fleet" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tariffs_fk" FOREIGN KEY ("tariffs_id") REFERENCES "public"."tariffs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fleet_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleet"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_tariffs_id_idx" ON "payload_locked_documents_rels" USING btree ("tariffs_id");
  CREATE INDEX "payload_locked_documents_rels_fleet_id_idx" ON "payload_locked_documents_rels" USING btree ("fleet_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tariffs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fleet" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tariffs" CASCADE;
  DROP TABLE "fleet" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tariffs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_fleet_fk";
  
  DROP INDEX "payload_locked_documents_rels_tariffs_id_idx";
  DROP INDEX "payload_locked_documents_rels_fleet_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tariffs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "fleet_id";
  DROP TYPE "public"."enum_tariffs_difficulty";`)
}
