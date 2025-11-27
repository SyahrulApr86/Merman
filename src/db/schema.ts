import { pgTable, serial, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => projects.id).notNull(),
    parentId: uuid("parent_id"), // Self-reference for folders, null for root
    name: text("name").notNull(),
    type: text("type", { enum: ["file", "folder"] }).notNull(),
    content: text("content"), // Null for folders
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
