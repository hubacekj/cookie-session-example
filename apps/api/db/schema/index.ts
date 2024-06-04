import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  hashedPassword: text("password_hash").notNull(),
});

export const sessions = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull()
});