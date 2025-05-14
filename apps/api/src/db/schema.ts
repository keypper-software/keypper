import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  activeOrganizationId: text("active_organization_id"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
});

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

export const apiKey = pgTable("api_key", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  projects: jsonb("projects").$type<string[]>(),
});

export const apiKeyRules = pgTable("api_key_rules", {
  id: text("id").primaryKey(),
  apiKeyId: text("api_key_id")
    .notNull()
    .references(() => apiKey.id),
});

export const apiKeyRulesRelations = relations(apiKeyRules, ({ one }) => ({
  apiKey: one(apiKey, {
    fields: [apiKeyRules.apiKeyId],
    references: [apiKey.id],
  }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  organization: one(organization, {
    fields: [apiKey.organizationId],
    references: [organization.id],
  }),
}));
