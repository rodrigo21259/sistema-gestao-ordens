import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  themePreference: mysqlEnum("themePreference", ["light", "dark"]).default("light").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table for storing sales orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientCode: varchar("clientCode", { length: 255 }).notNull(),
  product: varchar("product", { length: 255 }).notNull(),
  volume: decimal("volume", { precision: 18, scale: 4 }).notNull(),
  revenue: decimal("revenue", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Custom fields for dynamic form fields
 */
export const customFields = mysqlTable("customFields", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["TEXT", "NUMBER", "BOOLEAN", "DROPDOWN"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  options: json("options"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = typeof customFields.$inferInsert;

/**
 * Order custom field values
 */
export const orderCustomValues = mysqlTable("orderCustomValues", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  fieldId: int("fieldId").notNull(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrderCustomValue = typeof orderCustomValues.$inferSelect;
export type InsertOrderCustomValue = typeof orderCustomValues.$inferInsert;

/**
 * Ranking metrics configuration
 */
export const rankingMetrics = mysqlTable("rankingMetrics", {
  id: int("id").autoincrement().primaryKey(),
  metricName: varchar("metricName", { length: 255 }).notNull().unique(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RankingMetric = typeof rankingMetrics.$inferSelect;
export type InsertRankingMetric = typeof rankingMetrics.$inferInsert;

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  customValues: many(orderCustomValues),
}));

export const orderCustomValuesRelations = relations(orderCustomValues, ({ one }) => ({
  order: one(orders, {
    fields: [orderCustomValues.orderId],
    references: [orders.id],
  }),
  field: one(customFields, {
    fields: [orderCustomValues.fieldId],
    references: [customFields.id],
  }),
}));

export const customFieldsRelations = relations(customFields, ({ many }) => ({
  orderValues: many(orderCustomValues),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));