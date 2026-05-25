import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createAppointment,
  createShop,
  getAppointmentById,
  getShopByEmail,
  getShopById,
  getShopBySlug,
  getStaffPinHash,
  hasStaffPin,
  listAllShops,
  listAppointments,
  listTodayAppointments,
  setStaffPinHash,
  updateAppointmentStatus,
  updateShop,
} from "./db";

// ── 쿠키 이름 ────────────────────────────────────────────────────────────────
const STAFF_PIN_COOKIE = "staff_pin_verified";
const SHOP_SESSION_COOKIE = "shop_id";
const STAFF_PIN_COOKIE_MAX_AGE = 8 * 60 * 60; // 8시간

// ── shopId 추출 헬퍼 ─────────────────────────────────────────────────────────
// 요청에서 shopId를 추출: 쿠키 우선, 없으면 "demo"
function getShopIdFromCtx(ctx: { req: { cookies?: Record<string, string> } }): string {
  return ctx.req.cookies?.[SHOP_SESSION_COOKIE] ?? "demo";
}

// ── 직원 인증 미들웨어 ────────────────────────────────────────────────────────
const staffProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const cookie = ctx.req.cookies?.[STAFF_PIN_COOKIE];
  if (cookie !== "1") {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "직원 인증이 필요합니다" });
  }
  return next({ ctx });
});

// ── 슈퍼 어드민 미들웨어 ──────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다" });
  }
  return next({ ctx });
});

// ── Appointment 입력 스키마 ───────────────────────────────────────────────────
const appointmentInputSchema = z.object({
  id: z.string(),
  ownerName: z.string().min(1),
  phone: z.string().min(1),
  dogName: z.string().min(1),
  breed: z.string().default(""),
  age: z.string().default(""),
  weight: z.string().default(""),
  groomingRequest: z.string().default(""),
  sensitiveParts: z.array(z.string()).default([]),
  skinCondition: z.string().default("정상"),
  biteRisk: z.boolean().default(false),
  allergy: z.string().default("없음"),
  notes: z.string().default(""),
  estimatedTime: z.string().default(""),
  source: z.enum(["staff", "owner"]).default("owner"),
});

// ── 슬러그 유효성 검사 ────────────────────────────────────────────────────────
const slugSchema = z
  .string()
  .min(2)
  .max(30)
  .regex(/^[a-z0-9가-힣-]+$/, "영문 소문자, 숫자, 한글, 하이픈만 사용 가능합니다");

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── 매장(Shop) 라우터 ────────────────────────────────────────────────────────
  shop: router({
    /** 슬러그로 매장 정보 조회 (공개) */
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const shop = await getShopBySlug(input.slug);
        if (!shop || !shop.active) return null;
        return { id: shop.id, name: shop.name, slug: shop.slug, phone: shop.phone, description: shop.description };
      }),

    /** 현재 세션의 매장 정보 조회 */
    current: publicProcedure.query(async ({ ctx }) => {
      const shopId = getShopIdFromCtx(ctx);
      if (shopId === "demo") return null;
      const shop = await getShopById(shopId);
      if (!shop || !shop.active) return null;
      return { id: shop.id, name: shop.name, slug: shop.slug, phone: shop.phone, description: shop.description };
    }),

    /** 매장 세션 설정 (슬러그로 접속 시 호출) */
    setSession: publicProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const shop = await getShopBySlug(input.slug);
        if (!shop || !shop.active) {
          throw new TRPCError({ code: "NOT_FOUND", message: "매장을 찾을 수 없습니다" });
        }
        ctx.res.cookie(SHOP_SESSION_COOKIE, shop.id, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60, // 30일
          path: "/",
        });
        return { shopId: shop.id, name: shop.name };
      }),

    /** 매장 가입 */
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        slug: slugSchema,
        phone: z.string().min(8).max(20),
        ownerEmail: z.string().email(),
        address: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 슬러그 중복 확인
        const existing = await getShopBySlug(input.slug);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "이미 사용 중인 주소입니다. 다른 주소를 선택해주세요." });
        }
        // 이메일 중복 확인
        const emailExists = await getShopByEmail(input.ownerEmail);
        if (emailExists) {
          throw new TRPCError({ code: "CONFLICT", message: "이미 가입된 이메일입니다." });
        }

        const now = Date.now();
        const shopId = nanoid(16);
        await createShop({
          id: shopId,
          name: input.name,
          slug: input.slug,
          phone: input.phone,
          ownerEmail: input.ownerEmail,
          address: input.address ?? null,
          description: input.description ?? null,
          plan: "free",
          active: true,
          createdAt: now,
          updatedAt: now,
        });

        // 가입 후 자동으로 매장 세션 설정
        ctx.res.cookie(SHOP_SESSION_COOKIE, shopId, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        return { shopId, slug: input.slug, success: true };
      }),

    /** 슬러그 사용 가능 여부 확인 */
    checkSlug: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        const existing = await getShopBySlug(input.slug);
        return { available: !existing };
      }),
  }),

  // ── 직원 인증 라우터 ────────────────────────────────────────────────────────
  staff: router({
    hasPinSetup: publicProcedure.query(async ({ ctx }) => {
      const shopId = getShopIdFromCtx(ctx);
      return { hasPin: await hasStaffPin(shopId) };
    }),

    isAuthenticated: publicProcedure.query(({ ctx }) => {
      // PIN 인증 비활성화 - 누구나 직원 화면 접근 가능
      return { authenticated: true };
    }),

    verifyPin: publicProcedure
      .input(z.object({ pin: z.string().length(4) }))
      .mutation(async ({ ctx, input }) => {
        const shopId = getShopIdFromCtx(ctx);
        const hash = await getStaffPinHash(shopId);
        if (!hash) {
          throw new TRPCError({ code: "NOT_FOUND", message: "PIN이 설정되지 않았습니다. 먼저 PIN을 설정해주세요." });
        }
        const valid = await bcrypt.compare(input.pin, hash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "비밀번호가 올바르지 않습니다" });
        }
        ctx.res.cookie(STAFF_PIN_COOKIE, "1", {
          httpOnly: true,
          sameSite: "lax",
          maxAge: STAFF_PIN_COOKIE_MAX_AGE,
          path: "/",
        });
        return { success: true };
      }),

    setPin: publicProcedure
      .input(z.object({
        pin: z.string().length(4).regex(/^\d{4}$/, "4자리 숫자만 입력 가능합니다"),
        currentPin: z.string().length(4).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const shopId = getShopIdFromCtx(ctx);
        const existingHash = await getStaffPinHash(shopId);
        if (existingHash) {
          if (!input.currentPin) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "현재 비밀번호를 입력해주세요" });
          }
          const valid = await bcrypt.compare(input.currentPin, existingHash);
          if (!valid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "현재 비밀번호가 올바르지 않습니다" });
          }
        }
        const hash = await bcrypt.hash(input.pin, 10);
        await setStaffPinHash(hash, shopId);
        ctx.res.cookie(STAFF_PIN_COOKIE, "1", {
          httpOnly: true,
          sameSite: "lax",
          maxAge: STAFF_PIN_COOKIE_MAX_AGE,
          path: "/",
        });
        return { success: true };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(STAFF_PIN_COOKIE, { path: "/" });
      return { success: true };
    }),
  }),

  // ── 접수 라우터 ─────────────────────────────────────────────────────────────
  appointments: router({
    create: publicProcedure
      .input(appointmentInputSchema)
      .mutation(async ({ ctx, input }) => {
        const shopId = getShopIdFromCtx(ctx);
        const now = Date.now();
        await createAppointment({
          ...input,
          shopId,
          sensitiveParts: JSON.stringify(input.sensitiveParts),
          staffNote: "",
          status: "접수완료",
          createdAt: now,
          updatedAt: now,
        });
        return { id: input.id, success: true };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const appt = await getAppointmentById(input.id);
        if (!appt) return null;
        return {
          ...appt,
          sensitiveParts: (() => {
            try { return JSON.parse(appt.sensitiveParts); } catch { return []; }
          })(),
        };
      }),

    listActive: staffProcedure.query(async ({ ctx }) => {
      const shopId = getShopIdFromCtx(ctx);
      const list = await listTodayAppointments(shopId);
      return list.map(appt => ({
        ...appt,
        sensitiveParts: (() => {
          try { return JSON.parse(appt.sensitiveParts); } catch { return []; }
        })(),
      }));
    }),

    listToday: staffProcedure.query(async ({ ctx }) => {
      const shopId = getShopIdFromCtx(ctx);
      const list = await listTodayAppointments(shopId);
      return list.map(appt => ({
        ...appt,
        sensitiveParts: (() => {
          try { return JSON.parse(appt.sensitiveParts); } catch { return []; }
        })(),
      }));
    }),

    listAll: staffProcedure
      .input(z.object({ limit: z.number().min(1).max(500).default(200) }).optional())
      .query(async ({ ctx, input }) => {
        const shopId = getShopIdFromCtx(ctx);
        const list = await listAppointments(shopId, input?.limit ?? 200);
        return list.map(appt => ({
          ...appt,
          sensitiveParts: (() => {
            try { return JSON.parse(appt.sensitiveParts); } catch { return []; }
          })(),
        }));
      }),

    updateStatus: staffProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum([
          "접수완료", "미용준비중", "목욕중", "드라이중",
          "커트중", "마무리중", "완료", "특이사항있음",
        ]),
        staffNote: z.string().optional(),
        estimatedTime: z.string().optional(),
        completedPhoto: z.string().optional(),
        pickupEta: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateAppointmentStatus(
          input.id,
          input.status,
          input.staffNote,
          input.estimatedTime,
          input.completedPhoto,
          input.pickupEta,
        );
        return { success: true };
      }),
  }),

  // ── 슈퍼 어드민 라우터 ──────────────────────────────────────────────────────
  admin: router({
    /** 전체 매장 목록 */
    listShops: adminProcedure.query(async () => {
      return listAllShops();
    }),

    /** 매장 활성화/비활성화 */
    toggleShop: adminProcedure
      .input(z.object({ shopId: z.string(), active: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateShop(input.shopId, { active: input.active });
        return { success: true };
      }),

    /** 매장 플랜 변경 */
    updatePlan: adminProcedure
      .input(z.object({ shopId: z.string(), plan: z.enum(["free", "pro"]) }))
      .mutation(async ({ input }) => {
        await updateShop(input.shopId, { plan: input.plan });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
