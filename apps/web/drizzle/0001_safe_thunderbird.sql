CREATE TABLE "auth_phrase" (
	"id" text PRIMARY KEY NOT NULL,
	"phrase" text NOT NULL,
	"user_name" text NOT NULL,
	"machine_name" text NOT NULL,
	"operating_system" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_token" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"first_four_characters" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"machine_name" text NOT NULL,
	"operating_system" text NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"auth_phrase_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_auth_phrase_id_auth_phrase_id_fk" FOREIGN KEY ("auth_phrase_id") REFERENCES "public"."auth_phrase"("id") ON DELETE no action ON UPDATE no action;