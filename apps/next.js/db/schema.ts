import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user, organization } from "../auth-schema";

export * from "../auth-schema";

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
  deletedAt: timestamp("deleted_at"),
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
  deletedAt: timestamp("deleted_at"),
});

export const branch = pgTable("branch", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  environmentId: text("environment_id")
    .notNull()
    .references(() => environment.id),
  deletedAt: timestamp("deleted_at"),
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
  version: integer("version").notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const secretVersion = pgTable("secret_version", {
  id: text("id").primaryKey(),
  secretId: text("secret_id")
    .notNull()
    .references(() => secret.id),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull(),
  version: integer("version").notNull(),
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

export const authPhrase = pgTable("auth_phrase", {
  id: text("id").primaryKey(),
  phrase: text("phrase").notNull(),
  userName: text("user_name").notNull(),
  machineName: text("machine_name").notNull(),
  operatingSystem: text("operating_system").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
});

export const authToken = pgTable("auth_token", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  tokenHash: text("token_hash").notNull(),
  firstFourCharacters: text("first_four_characters").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  machineName: text("machine_name").notNull(),
  operatingSystem: text("operating_system").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  authPhraseId: text("auth_phrase_id")
    .notNull()
    .references(() => authPhrase.id),
});
