/**
 * Design System: Modern Clinic + Pet Care Brand
 * 전역 상태 관리 (localStorage 기반 - 서버 없는 정적 데모)
 * v4: 접수 폼, 사진 첨부, 픽업 예정시간, 담당자 메모 확장
 */

export type GroomingStatus =
  | "접수완료"
  | "미용준비중"
  | "목욕중"
  | "드라이중"
  | "커트중"
  | "마무리중"
  | "완료"
  | "특이사항있음";

export interface Appointment {
  id: string;
  ownerName: string;
  phone: string;
  dogName: string;
  breed: string;
  age: string;
  weight: string;
  groomingRequest: string;
  sensitiveParts: string[];
  skinCondition: string;
  biteRisk: boolean;
  allergy: string;
  notes: string;
  status: GroomingStatus;
  estimatedTime: string;
  staffNote: string;
  completedPhoto?: string; // base64 or URL
  pickupEta?: string; // 픽업 예정 시간
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

const STORAGE_KEY = "pet_grooming_appointments_v4";

export const STATUS_MESSAGES: Record<GroomingStatus, string> = {
  접수완료: "접수가 완료되었습니다. 미용 전 상태와 요청사항을 확인하고 있어요. 잠시 기다려 주세요.",
  미용준비중: "편안하게 미용받을 수 있도록 준비 중입니다. 곧 시작할게요!",
  목욕중: "지금 목욕을 진행 중입니다. 피부 상태도 꼼꼼히 확인하고 있어요 🛁",
  드라이중: "목욕이 끝났어요! 지금 드라이를 진행 중입니다. 조금만 더 기다려 주세요 💨",
  커트중: "요청해주신 스타일에 맞춰 커트를 진행 중입니다. 예쁘게 만들어드릴게요 ✂️",
  마무리중: "거의 다 됐어요! 마무리 정리와 최종 상태 확인 중입니다 ✨",
  완료: "미용이 완료되었습니다! 예쁘게 단장됐어요 🎉 픽업 준비 부탁드립니다.",
  특이사항있음: "미용 중 확인된 사항이 있습니다. 픽업 시 담당자가 자세히 안내드릴게요.",
};

export const STATUS_ORDER: GroomingStatus[] = [
  "접수완료",
  "미용준비중",
  "목욕중",
  "드라이중",
  "커트중",
  "마무리중",
  "완료",
];

export const STATUS_ICONS: Record<GroomingStatus, string> = {
  접수완료: "📋",
  미용준비중: "🐾",
  목욕중: "🛁",
  드라이중: "💨",
  커트중: "✂️",
  마무리중: "✨",
  완료: "🎉",
  특이사항있음: "⚠️",
};

export const STATUS_COLORS: Record<GroomingStatus, { bg: string; text: string; light: string }> = {
  접수완료:     { bg: "#0369A1", text: "white", light: "#E0F2FE" },
  미용준비중:   { bg: "#7C3AED", text: "white", light: "#EDE9FE" },
  목욕중:       { bg: "#1D4ED8", text: "white", light: "#DBEAFE" },
  드라이중:     { bg: "#D97706", text: "white", light: "#FEF9C3" },
  커트중:       { bg: "#059669", text: "white", light: "#D1FAE5" },
  마무리중:     { bg: "#DB2777", text: "white", light: "#FCE7F3" },
  완료:         { bg: "#1B4332", text: "white", light: "#D1FAE5" },
  특이사항있음: { bg: "#DC2626", text: "white", light: "#FEE2E2" },
};

export function getAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultAppointments();
    return JSON.parse(raw);
  } catch {
    return getDefaultAppointments();
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

export function getAppointmentById(id: string): Appointment | undefined {
  return getAppointments().find((a) => a.id === id);
}

export function updateAppointmentStatus(
  id: string,
  status: GroomingStatus,
  staffNote?: string,
  estimatedTime?: string
): void {
  const appointments = getAppointments();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx !== -1) {
    appointments[idx].status = status;
    appointments[idx].updatedAt = new Date().toISOString();
    if (status === "미용준비중" && !appointments[idx].startedAt) {
      appointments[idx].startedAt = new Date().toISOString();
    }
    if (status === "완료") {
      appointments[idx].completedAt = new Date().toISOString();
    }
    if (staffNote !== undefined) appointments[idx].staffNote = staffNote;
    if (estimatedTime !== undefined) appointments[idx].estimatedTime = estimatedTime;
    saveAppointments(appointments);
  }
}

export function addAppointment(appt: Appointment): void {
  const appointments = getAppointments();
  appointments.unshift(appt);
  saveAppointments(appointments);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function getDefaultAppointments(): Appointment[] {
  const now = new Date();
  const defaults: Appointment[] = [
    {
      id: "demo-001",
      ownerName: "김지수",
      phone: "010-1234-5678",
      dogName: "초코",
      breed: "말티즈",
      age: "3살",
      weight: "3.2kg",
      groomingRequest: "전체 클리핑 + 귀 청소",
      sensitiveParts: ["귀", "발"],
      skinCondition: "정상",
      biteRisk: false,
      allergy: "없음",
      notes: "귀 쪽 조심해주세요. 드라이 소리를 무서워해요.",
      status: "목욕중",
      estimatedTime: "약 1시간 30분",
      staffNote: "",
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      startedAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-002",
      ownerName: "박민준",
      phone: "010-9876-5432",
      dogName: "보리",
      breed: "포메라니안",
      age: "5살",
      weight: "2.8kg",
      groomingRequest: "곰돌이 컷 + 발톱 정리",
      sensitiveParts: ["배", "꼬리"],
      skinCondition: "건조",
      biteRisk: true,
      allergy: "없음",
      notes: "낯선 사람에게 예민합니다. 천천히 접근해주세요.",
      status: "접수완료",
      estimatedTime: "약 2시간",
      staffNote: "",
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "demo-003",
      ownerName: "이서연",
      phone: "010-5555-7777",
      dogName: "두부",
      breed: "비숑프리제",
      age: "2살",
      weight: "4.5kg",
      groomingRequest: "전체 미용 + 발톱 정리 + 귀 청소",
      sensitiveParts: [],
      skinCondition: "정상",
      biteRisk: false,
      allergy: "없음",
      notes: "",
      status: "완료",
      estimatedTime: "완료",
      staffNote: "피부 상태 매우 양호. 귀 안쪽 약간 붉음 — 귀가 자주 막히는 견종이니 주기적 청소 권장. 다음 방문 4주 후 권장.",
      completedPhoto: "",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      startedAt: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    },
  ];
  saveAppointments(defaults);
  return defaults;
}
