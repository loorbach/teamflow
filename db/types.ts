import { employees, teams } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Employee = InferSelectModel<typeof employees>;
export type Team = InferSelectModel<typeof teams>;