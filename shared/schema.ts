import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trusts = pgTable("trusts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  status: text("status").notNull().default("active"),
  constitutionDate: timestamp("constitution_date").notNull(),
  validity: timestamp("validity").notNull(),
  trustors: jsonb("trustors").notNull().default("[]"),
  beneficiaries: jsonb("beneficiaries").notNull().default("[]"),
  fiduciary: jsonb("fiduciary").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trustId: varchar("trust_id").notNull().references(() => trusts.id),
  purpose: text("purpose").notNull(),
  obligations: text("obligations").notNull(),
  remuneration: text("remuneration").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trustId: varchar("trust_id").notNull().references(() => trusts.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  participants: text("participants"),
  status: text("status").notNull().default("programado"),
  attachments: jsonb("attachments").notNull().default("[]"),
  includeInReport: boolean("include_in_report").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrustSchema = createInsertSchema(trusts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trust = typeof trusts.$inferSelect;
export type InsertTrust = z.infer<typeof insertTrustSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Extended Event type with user information for frontend display
export type EventWithUser = Event & {
  user: {
    username: string;
    name?: string;
  };
};
