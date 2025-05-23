import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user, organization } from "../../auth-schema";

export * from "../../auth-schema";

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
});

export const projectRelations = relations(project, ({ one }) => ({
  organization: one(organization, {
    fields: [project.organizationId],
    references: [organization.id],
  }),
}));

export const environment = pgTable("environment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
});

export const branch = pgTable("branch", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  environmentId: text("environment_id")
    .notNull()
    .references(() => environment.id),
});

export const secret = pgTable("secret", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  branchId: text("branch_id")
    .notNull()
    .references(() => branch.id),
  addedBy: text("added_by")
    .notNull()
    .references(() => user.id),
  version: text("version").notNull(), // e.g., "v1", "v2"
});

export const secretVersion = pgTable("secret_version", {
  id: text("id").primaryKey(),
  secretId: text("secret_id")
    .notNull()
    .references(() => secret.id),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  version: text("version").notNull(), // e.g., "v1", "v2"
});

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id),
  details: text("details"),
});
