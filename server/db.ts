import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, customFields, orderCustomValues, rankingMetrics, InsertOrder, InsertCustomField, InsertOrderCustomValue } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Orders queries
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orders);
}

export async function deleteOrder(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(orders).where(eq(orders.id, orderId));
}

// Custom fields queries
export async function createCustomField(data: InsertCustomField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customFields).values(data);
  return result;
}

export async function getActiveCustomFields() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(customFields).where(eq(customFields.isActive, true));
}

export async function getAllCustomFields() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(customFields);
}

export async function updateCustomField(fieldId: number, data: Partial<InsertCustomField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(customFields).set(data).where(eq(customFields.id, fieldId));
}

export async function deleteCustomField(fieldId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(customFields).where(eq(customFields.id, fieldId));
}

// Order custom values queries
export async function createOrderCustomValue(data: InsertOrderCustomValue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(orderCustomValues).values(data);
}

export async function getOrderCustomValues(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(orderCustomValues).where(eq(orderCustomValues.orderId, orderId));
}

export async function deleteOrderCustomValues(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(orderCustomValues).where(eq(orderCustomValues.orderId, orderId));
}

// Ranking metrics queries
export async function getRankingMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(rankingMetrics);
}

export async function getActiveRankingMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(rankingMetrics).where(eq(rankingMetrics.isActive, true));
}

export async function updateRankingMetric(metricId: number, weight: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(rankingMetrics).set({ weight }).where(eq(rankingMetrics.id, metricId));
}

export async function initializeRankingMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(rankingMetrics);
  if (existing.length === 0) {
    await db.insert(rankingMetrics).values([
      { metricName: "revenue", weight: "60.00", isActive: true },
      { metricName: "orderCount", weight: "40.00", isActive: true },
    ]);
  }
}

// User queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users);
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserTheme(userId: number, theme: "light" | "dark") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(users).set({ themePreference: theme }).where(eq(users.id, userId));
}
