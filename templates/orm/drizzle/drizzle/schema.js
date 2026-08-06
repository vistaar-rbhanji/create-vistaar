import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appInfo = pgTable("app_info", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  projectName: text("project_name").notNull(),
  frontend: text("frontend").notNull(),
  backend: text("backend").notNull(),
  database: text("database").notNull(),
  orm: text("orm").notNull(),
  uiFramework: text("ui_framework").notNull(),
  authentication: text("authentication").notNull(),
  docker: text("docker").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
