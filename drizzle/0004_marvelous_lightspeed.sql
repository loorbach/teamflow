ALTER TABLE "employee_notes" DROP CONSTRAINT "employee_notes_employee_id_employees_id_fk";
--> statement-breakpoint
ALTER TABLE "employee_notes" ADD CONSTRAINT "employee_notes_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;