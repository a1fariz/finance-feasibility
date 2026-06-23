CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"investment_cost" double precision DEFAULT 100000 NOT NULL,
	"monthly_revenue" double precision DEFAULT 15000 NOT NULL,
	"growth_rate" double precision DEFAULT 5 NOT NULL,
	"inflation_rate" double precision DEFAULT 2.5 NOT NULL,
	"maintenance_cost" double precision DEFAULT 2000 NOT NULL,
	"operating_cost" double precision DEFAULT 4000 NOT NULL,
	"tax_rate" double precision DEFAULT 20 NOT NULL,
	"residual_value" double precision DEFAULT 15000 NOT NULL,
	"depreciation_years" integer DEFAULT 5 NOT NULL,
	"discount_rate" double precision DEFAULT 10 NOT NULL,
	"analysis_years" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;