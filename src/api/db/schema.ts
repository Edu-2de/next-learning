import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const issueNumberSeq = pgSequence("issue_number_seq", {
  startWith: 0,
  minValue: 0,
  increment: 1,
});

export const issueStatusEnum = pgEnum("issue_status", [
  "backlog",
  "todo",
  "in_progress",
  "done",
]);

export const issues = pgTable("issues", {
  id: uuid().primaryKey().defaultRandom(),
  issueNumber: integer()
    .notNull()
    .unique()
    .default(sql`nextval('issue_number_seq')`),
  title: text().notNull(),
  description: text().notNull(),
  status: issueStatusEnum().notNull().default("backlog"),
  likes: integer().notNull().default(0),
  createdAt: timestamp().notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  issueId: uuid()
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  authorName: text().notNull(),
  authorAvatar: text().notNull(),
  text: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const issueLikes = pgTable("issue_likes", {
  id: uuid().primaryKey().defaultRandom(),
  issueId: uuid()
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
});

// Better Auth tables (plural names)
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text(),
  userAgent: text(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: uuid().primaryKey().defaultRandom(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verifications = pgTable("verifications", {
  id: uuid().primaryKey().defaultRandom(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
