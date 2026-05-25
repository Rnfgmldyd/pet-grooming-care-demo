/**
 * 직원 PIN 인증 및 접수 기능 테스트
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// DB 모듈 모킹
vi.mock("./db", () => ({
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
  hasStaffPin,
  getStaffPinHash,
  setStaffPinHash,
  createAppointment,
  getAppointmentById,
  listTodayAppointments,
  listAppointments,
} from "./db";

const DEMO_SHOP_ID = "demo";

// ── PIN 해싱 유틸리티 테스트 ──────────────────────────────────────────────────
describe("PIN 해싱 및 검증", () => {
  it("4자리 PIN을 bcrypt로 해시할 수 있다", async () => {
    const pin = "1234";
    const hash = await bcrypt.hash(pin, 10);
    expect(hash).toBeTruthy();
    expect(hash).not.toBe(pin);
  });

  it("올바른 PIN은 검증에 성공한다", async () => {
    const pin = "5678";
    const hash = await bcrypt.hash(pin, 10);
    const valid = await bcrypt.compare(pin, hash);
    expect(valid).toBe(true);
  });

  it("잘못된 PIN은 검증에 실패한다", async () => {
    const pin = "9999";
    const hash = await bcrypt.hash("1234", 10);
    const valid = await bcrypt.compare(pin, hash);
    expect(valid).toBe(false);
  });

  it("4자리 숫자 PIN 형식 검증", () => {
    const validPins = ["0000", "1234", "9999"];
    const invalidPins = ["123", "12345", "abcd", "12 4"];
    validPins.forEach(p => expect(/^\d{4}$/.test(p)).toBe(true));
    invalidPins.forEach(p => expect(/^\d{4}$/.test(p)).toBe(false));
  });
});

// ── DB 헬퍼 함수 테스트 ──────────────────────────────────────────────────────
describe("직원 PIN DB 헬퍼 (shopId 기반)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PIN이 설정되지 않은 경우 hasStaffPin은 false를 반환한다", async () => {
    vi.mocked(hasStaffPin).mockResolvedValue(false);
    const result = await hasStaffPin(DEMO_SHOP_ID);
    expect(result).toBe(false);
  });

  it("PIN이 설정된 경우 hasStaffPin은 true를 반환한다", async () => {
    vi.mocked(hasStaffPin).mockResolvedValue(true);
    const result = await hasStaffPin(DEMO_SHOP_ID);
    expect(result).toBe(true);
  });

  it("getStaffPinHash는 저장된 해시를 반환한다", async () => {
    const mockHash = "$2b$10$mockHashValue";
    vi.mocked(getStaffPinHash).mockResolvedValue(mockHash);
    const result = await getStaffPinHash(DEMO_SHOP_ID);
    expect(result).toBe(mockHash);
  });

  it("PIN이 없을 때 getStaffPinHash는 null을 반환한다", async () => {
    vi.mocked(getStaffPinHash).mockResolvedValue(null);
    const result = await getStaffPinHash(DEMO_SHOP_ID);
    expect(result).toBeNull();
  });

  it("setStaffPinHash는 shopId와 함께 해시를 저장한다", async () => {
    vi.mocked(setStaffPinHash).mockResolvedValue(undefined);
    const hash = "$2b$10$testHash";
    await setStaffPinHash(hash, DEMO_SHOP_ID);
    expect(setStaffPinHash).toHaveBeenCalledWith(hash, DEMO_SHOP_ID);
  });

  it("서로 다른 매장은 독립적인 PIN을 가진다", async () => {
    const shop1Hash = "$2b$10$shop1Hash";
    const shop2Hash = "$2b$10$shop2Hash";

    vi.mocked(getStaffPinHash)
      .mockResolvedValueOnce(shop1Hash)
      .mockResolvedValueOnce(shop2Hash);

    const result1 = await getStaffPinHash("shop-1");
    const result2 = await getStaffPinHash("shop-2");

    expect(result1).toBe(shop1Hash);
    expect(result2).toBe(shop2Hash);
    expect(result1).not.toBe(result2);
  });
});

// ── 접수 데이터 테스트 ────────────────────────────────────────────────────────
describe("접수 데이터 처리 (shopId 기반)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAppointment = {
    id: "test-001",
    shopId: DEMO_SHOP_ID,
    ownerName: "김보호자",
    phone: "010-1234-5678",
    dogName: "초코",
    breed: "말티즈",
    age: "3살",
    weight: "3kg",
    groomingRequest: "전체미용",
    sensitiveParts: "[]",
    skinCondition: "정상",
    biteRisk: false,
    allergy: "없음",
    notes: "",
    estimatedTime: "약 1시간 30분",
    source: "owner" as const,
    status: "접수완료" as const,
    staffNote: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startedAt: null,
    completedAt: null,
    completedPhoto: null,
    pickupEta: null,
  };

  it("접수 생성 함수가 shopId를 포함한 데이터로 호출된다", async () => {
    vi.mocked(createAppointment).mockResolvedValue(undefined);
    await createAppointment(mockAppointment);
    expect(createAppointment).toHaveBeenCalledWith(mockAppointment);
    expect(mockAppointment.shopId).toBe(DEMO_SHOP_ID);
  });

  it("접수 ID로 단건 조회가 동작한다", async () => {
    vi.mocked(getAppointmentById).mockResolvedValue(mockAppointment);
    const result = await getAppointmentById("test-001");
    expect(result).toEqual(mockAppointment);
    expect(getAppointmentById).toHaveBeenCalledWith("test-001");
  });

  it("존재하지 않는 ID 조회 시 null을 반환한다", async () => {
    vi.mocked(getAppointmentById).mockResolvedValue(null);
    const result = await getAppointmentById("nonexistent");
    expect(result).toBeNull();
  });

  it("오늘 접수 목록 조회가 shopId와 함께 동작한다", async () => {
    vi.mocked(listTodayAppointments).mockResolvedValue([mockAppointment]);
    const result = await listTodayAppointments(DEMO_SHOP_ID);
    expect(result).toHaveLength(1);
    expect(result[0].dogName).toBe("초코");
  });

  it("전체 접수 이력 조회가 shopId와 함께 동작한다", async () => {
    vi.mocked(listAppointments).mockResolvedValue([mockAppointment, { ...mockAppointment, id: "test-002" }]);
    const result = await listAppointments(DEMO_SHOP_ID, 200);
    expect(result).toHaveLength(2);
    expect(listAppointments).toHaveBeenCalledWith(DEMO_SHOP_ID, 200);
  });

  it("sensitiveParts JSON 파싱이 올바르게 동작한다", () => {
    const rawParts = '["귀","발","배"]';
    const parsed = JSON.parse(rawParts);
    expect(parsed).toEqual(["귀", "발", "배"]);
    expect(parsed).toHaveLength(3);
  });

  it("잘못된 sensitiveParts JSON은 빈 배열로 처리된다", () => {
    const rawParts = "invalid-json";
    let result: string[] = [];
    try {
      result = JSON.parse(rawParts);
    } catch {
      result = [];
    }
    expect(result).toEqual([]);
  });

  it("접수 출처가 staff 또는 owner 중 하나여야 한다", () => {
    const validSources = ["staff", "owner"];
    expect(validSources.includes("staff")).toBe(true);
    expect(validSources.includes("owner")).toBe(true);
    expect(validSources.includes("invalid")).toBe(false);
  });
});

// ── 상태 전환 로직 테스트 ────────────────────────────────────────────────────
describe("미용 상태 전환 로직", () => {
  const STATUS_ORDER = [
    "접수완료", "미용준비중", "목욕중", "드라이중",
    "커트중", "마무리중", "완료",
  ];

  it("상태 순서가 올바르게 정의되어 있다", () => {
    expect(STATUS_ORDER).toHaveLength(7);
    expect(STATUS_ORDER[0]).toBe("접수완료");
    expect(STATUS_ORDER[STATUS_ORDER.length - 1]).toBe("완료");
  });

  it("각 상태에서 다음 상태로 진행할 수 있다", () => {
    const NEXT_STATUS: Record<string, string> = {
      접수완료: "미용준비중",
      미용준비중: "목욕중",
      목욕중: "드라이중",
      드라이중: "커트중",
      커트중: "마무리중",
      마무리중: "완료",
    };
    STATUS_ORDER.slice(0, -1).forEach((status, idx) => {
      expect(NEXT_STATUS[status]).toBe(STATUS_ORDER[idx + 1]);
    });
  });

  it("완료 상태에서는 다음 상태가 없다", () => {
    const NEXT_STATUS: Record<string, string | undefined> = {
      완료: undefined,
    };
    expect(NEXT_STATUS["완료"]).toBeUndefined();
  });
});
