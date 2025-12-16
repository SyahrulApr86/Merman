import { pgTable, text, timestamp, uuid, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull().unique(),
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

    // MinIO storage (for files only)
    minioPath: text("minio_path"), // e.g., "projects/{projectId}/{fileId}.mmd"
    minioEtag: text("minio_etag"), // For cache invalidation

    // File metadata
    size: integer("size").default(0), // File size in bytes
    mimeType: text("mime_type").default("text/plain"),

    // Legacy: Keep content column for backward compatibility during migration
    // After migration, this can be removed
    content: text("content"), // Null for folders, will migrate to MinIO

    // Flags
    isMigrated: boolean("is_migrated").default(false), // Track MinIO migration status

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// File versions for history tracking
export const fileVersions = pgTable("file_versions", {
    id: uuid("id").defaultRandom().primaryKey(),
    fileId: uuid("file_id").references(() => files.id, { onDelete: "cascade" }).notNull(),

    // MinIO version info
    minioPath: text("minio_path").notNull(), // Path to versioned file
    minioEtag: text("minio_etag"),

    // Metadata
    size: integer("size").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    comment: text("comment"), // Optional version comment

    // Timestamp
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type FileVersion = typeof fileVersions.$inferSelect;
export type NewFileVersion = typeof fileVersions.$inferInsert;
