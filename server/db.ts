import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { appointments, InsertAppointment, InsertShop, InsertUser, shops, staffSettings, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

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
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
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
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Shops ───────────────────────────────────────────────────────────────────

export async function createShop(data: InsertShop) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(shops).values(data);
  return data;
}

export async function getShopById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getShopBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shops).where(eq(shops.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getShopByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shops).where(eq(shops.ownerEmail, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listAllShops() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shops).orderBy(desc(shops.createdAt));
}

export async function updateShop(id: string, data: Partial<InsertShop>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shops).set({ ...data, updatedAt: Date.now() }).where(eq(shops.id, id));
}

// ── Staff Settings ──────────────────────────────────────────────────────────

export async function getStaffPinHash(shopId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staffSettings).where(eq(staffSettings.shopId, shopId)).limit(1);
  return result.length > 0 ? result[0].pinHash : null;
}

export async function setStaffPinHash(pinHash: string, shopId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(staffSettings)
    .values({ shopId, pinHash })
    .onDuplicateKeyUpdate({ set: { pinHash } });
}

export async function hasStaffPin(shopId: string): Promise<boolean> {
  const hash = await getStaffPinHash(shopId);
  return hash !== null;
}

// ── Appointments ────────────────────────────────────────────────────────────

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appointments).values(data);
  return data;
}

export async function getAppointmentById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listAppointments(shopId: string, limit = 200, sinceMs?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(appointments.shopId, shopId),
    ...(sinceMs ? [gte(appointments.createdAt, sinceMs)] : []),
  ];
  return db
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(desc(appointments.createdAt))
    .limit(limit);
}

export async function listTodayAppointments(shopId: string) {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstNow = now.getTime() + kstOffset;
  const kstMidnight = kstNow - (kstNow % (24 * 60 * 60 * 1000));
  const utcMidnightMs = kstMidnight - kstOffset;
  return listAppointments(shopId, 200, utcMidnightMs);
}

export async function updateAppointmentStatus(
  id: string,
  status: InsertAppointment["status"],
  staffNote?: string,
  estimatedTime?: string,
  completedPhoto?: string,
  pickupEta?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = Date.now();
  const updateData: Partial<InsertAppointment> = { status, updatedAt: now };
  if (status === "미용준비중") {
    const existing = await getAppointmentById(id);
    if (existing && !existing.startedAt) updateData.startedAt = now;
  }
  if (status === "완료") updateData.completedAt = now;
  if (staffNote !== undefined) updateData.staffNote = staffNote;
  if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
  if (completedPhoto !== undefined) updateData.completedPhoto = completedPhoto;
  if (pickupEta !== undefined) updateData.pickupEta = pickupEta;
  await db.update(appointments).set(updateData).where(eq(appointments.id, id));
}
