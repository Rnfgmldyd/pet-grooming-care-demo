import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 매장(Shop) 테이블 - SaaS 멀티테넌트 핵심
 * 각 애견미용실이 가입하면 하나의 shop 레코드가 생성됩니다.
 */
export const shops = mysqlTable("shops", {
  id: varchar("id", { length: 64 }).primaryKey(),
  /** 매장명 */
  name: varchar("name", { length: 100 }).notNull(),
  /** 서브도메인 슬러그 (예: "몽몽살롱" → 몽몽살롱.grooминgnote.com) */
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  /** 매장 전화번호 */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** 매장 주소 (선택) */
  address: text("address"),
  /** 매장 소개 (선택) */
  description: text("description"),
  /** 가입자 이메일 */
  ownerEmail: varchar("ownerEmail", { length: 320 }).notNull(),
  /** 플랜: free | pro */
  plan: mysqlEnum("plan", ["free", "pro"]).notNull(),
  /** 활성화 여부 */
  active: boolean("active").notNull().default(true),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
});

export type Shop = typeof shops.$inferSelect;
export type InsertShop = typeof shops.$inferInsert;

/**
 * 직원 설정 테이블 - 4자리 PIN 비밀번호 저장
 * shopId를 키로 사용하여 매장별 PIN 관리
 */
export const staffSettings = mysqlTable("staff_settings", {
  id: int("id").autoincrement().primaryKey(),
  shopId: varchar("shopId", { length: 64 }).notNull().unique(),
  /** 4자리 PIN (bcrypt 해시 저장) */
  pinHash: varchar("pinHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StaffSettings = typeof staffSettings.$inferSelect;

/**
 * 접수 이력 테이블 - 모든 미용 접수 기록
 */
export const appointments = mysqlTable("appointments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  /** 매장 ID (멀티테넌트) */
  shopId: varchar("shopId", { length: 64 }).notNull(),
  /** 보호자 정보 */
  ownerName: varchar("ownerName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  /** 반려견 정보 */
  dogName: varchar("dogName", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }).notNull(),
  age: varchar("age", { length: 20 }).notNull(),
  weight: varchar("weight", { length: 20 }).notNull(),
  /** 미용 요청 */
  groomingRequest: text("groomingRequest").notNull(),
  sensitiveParts: text("sensitiveParts").notNull(), // JSON array
  skinCondition: varchar("skinCondition", { length: 50 }).notNull(),
  biteRisk: boolean("biteRisk").notNull().default(false),
  allergy: text("allergy").notNull(),
  notes: text("notes").notNull(),
  /** 미용 진행 상태 */
  status: mysqlEnum("status", [
    "접수완료",
    "미용준비중",
    "목욕중",
    "드라이중",
    "커트중",
    "마무리중",
    "완료",
    "특이사항있음",
  ])
    .notNull()
    .default("접수완료"),
  estimatedTime: varchar("estimatedTime", { length: 50 }).notNull(),
  staffNote: text("staffNote").notNull(),
  completedPhoto: text("completedPhoto"),
  pickupEta: varchar("pickupEta", { length: 50 }),
  /** 접수 출처: 직원 직접 접수 or 보호자 QR 접수 */
  source: mysqlEnum("source", ["staff", "owner"]).notNull().default("staff"),
  /** 타임스탬프 (UTC ms) */
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
  updatedAt: bigint("updatedAt", { mode: "number" }).notNull(),
  startedAt: bigint("startedAt", { mode: "number" }),
  completedAt: bigint("completedAt", { mode: "number" }),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
