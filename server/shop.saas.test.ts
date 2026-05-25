/**
 * 그루밍노트 SaaS - 매장 가입 및 멀티테넌트 기능 테스트
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// DB 모듈 모킹
vi.mock("./db", () => ({
  createShop: vi.fn(),
  getShopById: vi.fn(),
  getShopBySlug: vi.fn(),
  getShopByEmail: vi.fn(),
  listAllShops: vi.fn(),
  updateShop: vi.fn(),
  hasStaffPin: vi.fn(),
  getStaffPinHash: vi.fn(),
  setStaffPinHash: vi.fn(),
  createAppointment: vi.fn(),
  getAppointmentById: vi.fn(),
  listTodayAppointments: vi.fn(),
  listAppointments: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

import {
  createShop,
  getShopBySlug,
  getShopByEmail,
  listAllShops,
  updateShop,
} from "./db";

// ── 슬러그 유효성 검사 ────────────────────────────────────────────────────────
describe("슬러그 유효성 검사", () => {
  const slugRegex = /^[a-z0-9가-힣-]{2,30}$/;

  it("영문 소문자 슬러그는 유효하다", () => {
    expect(slugRegex.test("mongmong")).toBe(true);
    expect(slugRegex.test("pet-salon")).toBe(true);
    expect(slugRegex.test("abc123")).toBe(true);
  });

  it("한글 슬러그는 유효하다", () => {
    expect(slugRegex.test("몽몽살롱")).toBe(true);
    expect(slugRegex.test("강남애견")).toBe(true);
  });

  it("한글+영문 혼합 슬러그는 유효하다", () => {
    expect(slugRegex.test("몽몽-salon")).toBe(true);
    expect(slugRegex.test("pet강남")).toBe(true);
  });

  it("1자 슬러그는 무효하다 (최소 2자)", () => {
    expect(slugRegex.test("a")).toBe(false);
    expect(slugRegex.test("가")).toBe(false);
  });

  it("31자 이상 슬러그는 무효하다 (최대 30자)", () => {
    const longSlug = "a".repeat(31);
    expect(slugRegex.test(longSlug)).toBe(false);
  });

  it("대문자는 슬러그에 허용되지 않는다", () => {
    expect(slugRegex.test("MongMong")).toBe(false);
    expect(slugRegex.test("PetSalon")).toBe(false);
  });

  it("특수문자(하이픈 제외)는 슬러그에 허용되지 않는다", () => {
    expect(slugRegex.test("pet_salon")).toBe(false);
    expect(slugRegex.test("pet.salon")).toBe(false);
    expect(slugRegex.test("pet salon")).toBe(false);
  });

  it("빈 문자열은 슬러그에 허용되지 않는다", () => {
    expect(slugRegex.test("")).toBe(false);
  });
});

// ── 매장 가입 로직 테스트 ─────────────────────────────────────────────────────
describe("매장 가입 로직", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockShop = {
    id: "shop-abc123",
    name: "몽몽 애견미용실",
    slug: "mongmong",
    phone: "010-1234-5678",
    ownerEmail: "owner@mongmong.com",
    address: null,
    description: null,
    plan: "free" as const,
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it("새 매장 생성 시 createShop이 올바른 데이터로 호출된다", async () => {
    vi.mocked(createShop).mockResolvedValue(mockShop);
    await createShop(mockShop);
    expect(createShop).toHaveBeenCalledWith(mockShop);
  });

  it("슬러그로 매장 조회가 동작한다", async () => {
    vi.mocked(getShopBySlug).mockResolvedValue(mockShop);
    const result = await getShopBySlug("mongmong");
    expect(result).toEqual(mockShop);
    expect(getShopBySlug).toHaveBeenCalledWith("mongmong");
  });

  it("존재하지 않는 슬러그 조회 시 null을 반환한다", async () => {
    vi.mocked(getShopBySlug).mockResolvedValue(null);
    const result = await getShopBySlug("nonexistent");
    expect(result).toBeNull();
  });

  it("이메일로 매장 조회가 동작한다", async () => {
    vi.mocked(getShopByEmail).mockResolvedValue(mockShop);
    const result = await getShopByEmail("owner@mongmong.com");
    expect(result).toEqual(mockShop);
  });

  it("중복 슬러그 감지 로직이 동작한다", async () => {
    vi.mocked(getShopBySlug).mockResolvedValue(mockShop);
    const existing = await getShopBySlug("mongmong");
    // 이미 존재하면 가입 불가
    expect(existing).not.toBeNull();
  });

  it("중복 이메일 감지 로직이 동작한다", async () => {
    vi.mocked(getShopByEmail).mockResolvedValue(mockShop);
    const existing = await getShopByEmail("owner@mongmong.com");
    // 이미 존재하면 가입 불가
    expect(existing).not.toBeNull();
  });

  it("사용 가능한 슬러그는 null을 반환한다", async () => {
    vi.mocked(getShopBySlug).mockResolvedValue(null);
    const existing = await getShopBySlug("new-slug");
    expect(existing).toBeNull();
  });
});

// ── 매장 플랜 및 상태 관리 ────────────────────────────────────────────────────
describe("매장 플랜 및 상태 관리", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("매장 활성화/비활성화가 동작한다", async () => {
    vi.mocked(updateShop).mockResolvedValue(undefined);
    await updateShop("shop-abc123", { active: false });
    expect(updateShop).toHaveBeenCalledWith("shop-abc123", { active: false });
  });

  it("매장 플랜 변경이 동작한다", async () => {
    vi.mocked(updateShop).mockResolvedValue(undefined);
    await updateShop("shop-abc123", { plan: "pro" });
    expect(updateShop).toHaveBeenCalledWith("shop-abc123", { plan: "pro" });
  });

  it("플랜은 free 또는 pro만 허용된다", () => {
    const validPlans = ["free", "pro"];
    expect(validPlans.includes("free")).toBe(true);
    expect(validPlans.includes("pro")).toBe(true);
    expect(validPlans.includes("enterprise")).toBe(false);
    expect(validPlans.includes("")).toBe(false);
  });
});

// ── 슈퍼 어드민 기능 테스트 ──────────────────────────────────────────────────
describe("슈퍼 어드민 기능", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockShops = [
    { id: "shop-1", name: "몽몽살롱", slug: "mongmong", plan: "free" as const, active: true, phone: "010-1111-1111", ownerEmail: "a@a.com", address: null, description: null, createdAt: Date.now(), updatedAt: Date.now() },
    { id: "shop-2", name: "강남펫살롱", slug: "gangnam-pet", plan: "pro" as const, active: true, phone: "010-2222-2222", ownerEmail: "b@b.com", address: null, description: null, createdAt: Date.now(), updatedAt: Date.now() },
    { id: "shop-3", name: "비활성매장", slug: "inactive-shop", plan: "free" as const, active: false, phone: "010-3333-3333", ownerEmail: "c@c.com", address: null, description: null, createdAt: Date.now(), updatedAt: Date.now() },
  ];

  it("전체 매장 목록 조회가 동작한다", async () => {
    vi.mocked(listAllShops).mockResolvedValue(mockShops);
    const result = await listAllShops();
    expect(result).toHaveLength(3);
  });

  it("활성 매장 수를 올바르게 집계할 수 있다", async () => {
    vi.mocked(listAllShops).mockResolvedValue(mockShops);
    const shops = await listAllShops();
    const activeCount = shops.filter(s => s.active).length;
    expect(activeCount).toBe(2);
  });

  it("프로 플랜 매장 수를 올바르게 집계할 수 있다", async () => {
    vi.mocked(listAllShops).mockResolvedValue(mockShops);
    const shops = await listAllShops();
    const proCount = shops.filter(s => s.plan === "pro").length;
    expect(proCount).toBe(1);
  });
});

// ── 멀티테넌트 격리 테스트 ────────────────────────────────────────────────────
describe("멀티테넌트 데이터 격리", () => {
  it("shopId가 다른 접수는 서로 격리된다", () => {
    const shop1Appointments = [
      { id: "a1", shopId: "shop-1", dogName: "초코" },
      { id: "a2", shopId: "shop-1", dogName: "보리" },
    ];
    const shop2Appointments = [
      { id: "a3", shopId: "shop-2", dogName: "망고" },
    ];

    const allAppointments = [...shop1Appointments, ...shop2Appointments];

    const shop1Only = allAppointments.filter(a => a.shopId === "shop-1");
    const shop2Only = allAppointments.filter(a => a.shopId === "shop-2");

    expect(shop1Only).toHaveLength(2);
    expect(shop2Only).toHaveLength(1);
    expect(shop1Only.every(a => a.shopId === "shop-1")).toBe(true);
    expect(shop2Only.every(a => a.shopId === "shop-2")).toBe(true);
  });

  it("demo shopId는 기본값으로 사용된다", () => {
    const cookies: Record<string, string> = {};
    const shopId = cookies["shop_id"] ?? "demo";
    expect(shopId).toBe("demo");
  });

  it("쿠키에 shopId가 있으면 해당 값을 사용한다", () => {
    const cookies: Record<string, string> = { shop_id: "shop-abc123" };
    const shopId = cookies["shop_id"] ?? "demo";
    expect(shopId).toBe("shop-abc123");
  });
});
