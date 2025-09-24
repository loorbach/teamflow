CREATE TABLE "employee_tags" (
	"employee_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "employee_tags_employee_id_tag_id_pk" PRIMARY KEY("employee_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"key" varchar(25) NOT NULL,
	"label" varchar(50) NOT NULL,
	CONSTRAINT "tags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "employee_tags" ADD CONSTRAINT "employee_tags_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_tags" ADD CONSTRAINT "employee_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;