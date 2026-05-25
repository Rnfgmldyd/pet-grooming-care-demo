/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           🐾 애견미용 보호자 안심 안내 시스템 — 매장 설정 파일           ║
 * ║                                                                  ║
 * ║  이 파일만 수정하면 매장 정보, 컷 종류, 이미지, 가격이 모두 바뀝니다.    ║
 * ║  납품 후 각 업체에서 직접 커스텀하세요.                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * 수정 가능 항목:
 *  - SHOP: 매장명, 전화번호, 주소, 운영시간, SNS 링크
 *  - BASE_SERVICES: 기본 서비스 목록 (목욕, 위생, 전체 등)
 *  - CUT_TYPES: 컷 종류 목록 (이미지, 이름, 설명, 가격 등)
 *  - SCISSOR_STYLES: 가위컷 세부 스타일
 *  - GROOMING_STAGES: 직원 화면에 표시되는 미용 진행 단계
 *  - GUIDE_BEFORE: 방문 전 안내 체크리스트
 *  - AFTER_CARE: 귀가 후 관리 팁
 *  - BREEDS: 견종 목록
 */

// ─────────────────────────────────────────────
// 1. 매장 기본 정보
// ─────────────────────────────────────────────
export const SHOP = {
  /** 매장명 (헤더, 타이틀 등에 표시) */
  name: "몽몽살롱",

  /** 서브타이틀 */
  subtitle: "애견미용 전문점",

  /** 대표 전화번호 */
  phone: "010-0000-0000",

  /** 주소 (선택) */
  address: "서울시 강남구 테헤란로 123",

  /** 운영시간 */
  hours: "평일 10:00 ~ 19:00 / 주말 10:00 ~ 17:00",

  /** 네이버 리뷰 URL (없으면 빈 문자열 "") */
  naverReviewUrl: "",

  /** 카카오 리뷰 URL (없으면 빈 문자열 "") */
  kakaoReviewUrl: "",

  /** 인스타그램 URL (없으면 빈 문자열 "") */
  instagramUrl: "",

  /** 매장 로고 이모지 (이미지 없을 때 대체 표시) */
  logoEmoji: "🐾",

  /** 홈 히어로 슬로건 (짧고 임팩트 있게) */
  heroSlogan: "미용 중 전화,\n이제 받지 마세요.",

  /** 홈 히어로 서브 문구 */
  heroDesc: "보호자가 링크 하나로 모든 과정을 확인합니다.\n직원은 버튼 하나만 누르면 됩니다.",
} as const;

// ─────────────────────────────────────────────
// 2. 기본 서비스 목록
//    hasCut: true → 다음 단계에서 컷 종류 선택
// ─────────────────────────────────────────────
export type BaseService = {
  id: string;
  label: string;
  emoji: string;
  /** 이미지 URL (CDN 주소 또는 /로 시작하는 public 경로) */
  img: string;
  desc: string;
  detail: string;
  time: string;
  price: string;
  bgColor: string;
  borderColor: string;
  hasCut: boolean;
};

export const BASE_SERVICES: BaseService[] = [
  {
    id: "bath-dry",
    label: "목욕 + 드라이",
    emoji: "🛁",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-bath-dry-WpVjPVk7FbkrkhKiiVCa2Z.webp",
    desc: "커트 없이 목욕과 드라이만 진행",
    detail: "전용 샴푸로 깨끗하게 목욕 후 전문 드라이어로 부드럽게 드라이합니다. 털 상태에 따라 컨디셔너를 추가 사용합니다.",
    time: "40분 ~ 1시간",
    price: "2~4만원",
    bgColor: "bg-[#EFF6FF]",
    borderColor: "border-[#93C5FD]",
    hasCut: false,
  },
  {
    id: "hygiene",
    label: "위생 미용",
    emoji: "✂️",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-hygiene-QSWw4aoDBnSfYqteYpnG85.webp",
    desc: "발바닥, 항문 주변, 배 부위만 클리핑",
    detail: "발바닥 털, 항문 주변, 배 부위 등 위생에 필요한 부위만 짧게 정리합니다. 목욕 없이 진행 가능합니다.",
    time: "20 ~ 30분",
    price: "1~2만원",
    bgColor: "bg-[#F5F3FF]",
    borderColor: "border-[#C4B5FD]",
    hasCut: false,
  },
  {
    id: "bath-cut",
    label: "목욕 + 커트",
    emoji: "🪮",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-full-7YgD92qEUKUEYYD52GNhz9.webp",
    desc: "목욕 후 원하는 스타일로 커트",
    detail: "목욕 + 드라이 후 원하시는 스타일로 커트를 진행합니다. 다음 단계에서 커트 스타일을 선택하세요.",
    time: "1시간 30분 ~ 2시간",
    price: "4~8만원",
    bgColor: "bg-[#F0FDF4]",
    borderColor: "border-[#86EFAC]",
    hasCut: true,
  },
  {
    id: "full",
    label: "전체 미용 패키지",
    emoji: "⭐",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-full-7YgD92qEUKUEYYD52GNhz9.webp",
    desc: "목욕 + 커트 + 발톱 + 귀 청소 전부",
    detail: "목욕, 드라이, 커트, 발톱 정리, 귀 청소까지 모든 미용을 한 번에 진행하는 풀 패키지입니다.",
    time: "2시간 ~ 2시간 30분",
    price: "6~10만원",
    bgColor: "bg-[#FFFBEB]",
    borderColor: "border-[#FDE68A]",
    hasCut: true,
  },
];

// ─────────────────────────────────────────────
// 3. 컷 종류 목록
//    hasScissorStyle: true → 가위컷 세부 스타일 선택 단계 추가
// ─────────────────────────────────────────────
export type CutType = {
  id: string;
  label: string;
  img: string;
  desc: string;
  detail: string;
  tags: string[];
  bgColor: string;
  borderColor: string;
  hasScissorStyle: boolean;
};

export const CUT_TYPES: CutType[] = [
  {
    id: "teddy",
    label: "곰돌이 컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-teddy-muS94CyEyYXwzBDdD4qgBG.webp",
    desc: "둥글고 포근한 곰돌이 스타일",
    detail: "머리, 몸, 다리를 모두 둥글게 정리하여 봉제인형처럼 귀여운 스타일입니다. 클리퍼와 가위를 함께 사용합니다.",
    tags: ["인기 1위", "귀여움", "관리 쉬움"],
    bgColor: "bg-[#F0FDF4]",
    borderColor: "border-[#86EFAC]",
    hasScissorStyle: false,
  },
  {
    id: "sporting",
    label: "스포팅 컷 (퍼피컷)",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-sporting-ay6xuctgrgZJ2V2qSprEwb.webp",
    desc: "전체를 짧고 균일하게 클리핑",
    detail: "클리퍼로 전체를 짧고 균일하게 정리합니다. 여름철에 시원하고 관리가 매우 편합니다.",
    tags: ["여름 추천", "관리 편함", "시원함"],
    bgColor: "bg-[#EFF6FF]",
    borderColor: "border-[#93C5FD]",
    hasScissorStyle: false,
  },
  {
    id: "face",
    label: "얼굴 컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-face-7YczUMZN3zF6gp6Z5NXwVC.webp",
    desc: "얼굴 부위만 깔끔하게 정리",
    detail: "눈 주변, 입 주변, 귀 앞쪽 등 얼굴 부위만 정리합니다. 몸은 그대로 두고 얼굴만 단정하게 만들어 드립니다.",
    tags: ["부분 미용", "눈 시원하게", "빠른 시간"],
    bgColor: "bg-[#FFF7ED]",
    borderColor: "border-[#FED7AA]",
    hasScissorStyle: false,
  },
  {
    id: "scissors",
    label: "가위 컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-scissors-natural-aMURFx4vUxVAaR8QGeFppZ.webp",
    desc: "가위로만 섬세하게 스타일링",
    detail: "클리퍼 없이 가위만으로 섬세하게 스타일을 만듭니다. 다음 단계에서 원하는 가위컷 스타일을 선택하세요.",
    tags: ["고급 기술", "섬세함", "스타일 다양"],
    bgColor: "bg-[#FDF4FF]",
    borderColor: "border-[#E879F9]",
    hasScissorStyle: true,
  },
];

// ─────────────────────────────────────────────
// 4. 가위컷 세부 스타일
// ─────────────────────────────────────────────
export type ScissorStyle = {
  id: string;
  label: string;
  img: string;
  desc: string;
  detail: string;
  tags: string[];
};

export const SCISSOR_STYLES: ScissorStyle[] = [
  {
    id: "scissors-round",
    label: "라운드 가위컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-scissors-round-o59mhZUm9xgJrx2v3u24rT.webp",
    desc: "완벽한 구형 실루엣, 인형 같은 스타일",
    detail: "머리부터 발끝까지 완벽한 구형으로 다듬어 마치 봉제 인형처럼 귀여운 스타일입니다. 고도의 기술이 필요합니다.",
    tags: ["인형 같은", "귀여움 최고", "고급 기술"],
  },
  {
    id: "scissors-natural",
    label: "내추럴 가위컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-scissors-natural-aMURFx4vUxVAaR8QGeFppZ.webp",
    desc: "자연스럽게 흐르는 우아한 스타일",
    detail: "털의 자연스러운 흐름을 살려 가위로 섬세하게 다듬습니다. 우아하고 자연스러운 분위기를 연출합니다.",
    tags: ["자연스러움", "우아함", "일상 적합"],
  },
  {
    id: "scissors-teddy",
    label: "가위 곰돌이 컷",
    img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663648465526/eCX6hup9YyVPgFJ7wr6qR9/cut-teddy-muS94CyEyYXwzBDdD4qgBG.webp",
    desc: "가위로만 만드는 곰돌이 스타일",
    detail: "클리퍼 없이 가위만으로 곰돌이 스타일을 완성합니다. 클리퍼 알레르기가 있거나 예민한 강아지에게 적합합니다.",
    tags: ["클리퍼 없음", "예민견 적합", "부드러움"],
  },
];

// ─────────────────────────────────────────────
// 5. 직원 화면 — 미용 진행 단계
//    StaffPage에서 버튼으로 단계를 클릭하면 보호자 화면에 표시됨
// ─────────────────────────────────────────────
export type GroomingStage = {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  /** 보호자에게 보내는 알림 메시지 */
  notifyMsg: string;
};

export const GROOMING_STAGES: GroomingStage[] = [
  {
    id: "checkin",
    label: "접수완료",
    emoji: "📋",
    desc: "접수가 완료되었습니다",
    notifyMsg: "접수가 완료되었습니다. 곧 미용을 시작합니다.",
  },
  {
    id: "bath",
    label: "목욕중",
    emoji: "🛁",
    desc: "목욕을 진행하고 있습니다",
    notifyMsg: "목욕을 시작했습니다. 편안하게 기다려 주세요.",
  },
  {
    id: "dry",
    label: "드라이중",
    emoji: "💨",
    desc: "드라이를 진행하고 있습니다",
    notifyMsg: "드라이 중입니다. 조금만 더 기다려 주세요.",
  },
  {
    id: "cut",
    label: "커트중",
    emoji: "✂️",
    desc: "커트를 진행하고 있습니다",
    notifyMsg: "커트를 시작했습니다. 예쁘게 단장 중이에요!",
  },
  {
    id: "finish",
    label: "마무리중",
    emoji: "🪮",
    desc: "마무리 손질 중입니다",
    notifyMsg: "마무리 손질 중입니다. 거의 다 됐어요!",
  },
  {
    id: "complete",
    label: "미용완료",
    emoji: "🎉",
    desc: "미용이 완료되었습니다",
    notifyMsg: "미용이 완료되었습니다! 픽업 부탁드립니다.",
  },
];

// ─────────────────────────────────────────────
// 6. 방문 전 안내 체크리스트
// ─────────────────────────────────────────────
export type GuideItem = {
  icon: string;
  title: string;
  desc: string;
  tag: "필수" | "중요" | "권장" | "참고";
};

export const GUIDE_BEFORE: GuideItem[] = [
  {
    icon: "🏥",
    title: "건강 상태 공유",
    desc: "피부 질환, 귀 염증, 슬개골, 심장 질환 등 특이사항은 접수 시 꼭 알려주세요.",
    tag: "필수",
  },
  {
    icon: "🦷",
    title: "입질·예민함 사전 안내",
    desc: "낯선 환경에 예민하거나 입질이 있는 경우 미리 알려주시면 안전하게 진행합니다.",
    tag: "필수",
  },
  {
    icon: "⏰",
    title: "예약 시간 5분 전 도착",
    desc: "5분 전 도착 시 반려견 상태 확인이 더 원활합니다. 10분 이상 지각 시 미용 시간이 조정될 수 있습니다.",
    tag: "중요",
  },
  {
    icon: "🪮",
    title: "털 엉킴 사전 확인",
    desc: "털 엉킴이 심한 경우 추가 시간·비용이 발생할 수 있습니다. 가볍게 빗질해 오시면 도움이 됩니다.",
    tag: "중요",
  },
  {
    icon: "🚶",
    title: "방문 전 산책 & 배변",
    desc: "방문 전 가벼운 산책과 배변을 마치고 오시면 미용이 더 편안하게 진행됩니다.",
    tag: "권장",
  },
  {
    icon: "📦",
    title: "픽업 준비",
    desc: "완료 안내를 받으시면 가능한 빠른 시간 내 픽업을 부탁드립니다. 1시간 이상 경과 시 추가 비용이 발생할 수 있습니다.",
    tag: "참고",
  },
];

// ─────────────────────────────────────────────
// 7. 귀가 후 관리 팁
// ─────────────────────────────────────────────
export type AfterCareItem = {
  icon: string;
  title: string;
  desc: string;
};

export const AFTER_CARE: AfterCareItem[] = [
  {
    icon: "🪮",
    title: "빗질",
    desc: "귀가 후 부드럽게 빗질해 주시면 털 상태 유지에 도움이 됩니다.",
  },
  {
    icon: "💧",
    title: "수분 공급",
    desc: "미용 후 충분한 물을 마실 수 있도록 해주세요.",
  },
  {
    icon: "🌡️",
    title: "체온 관리",
    desc: "드라이 후 체온이 낮아질 수 있으니 따뜻한 환경을 유지해주세요.",
  },
  {
    icon: "👀",
    title: "피부 확인",
    desc: "미용 후 1~2일 내 피부 발적이나 이상 증상이 있으면 수의사 상담을 권장합니다.",
  },
];

// ─────────────────────────────────────────────
// 8. 예상 소요시간 테이블
// ─────────────────────────────────────────────
export const TIME_TABLE = [
  { type: "소형견", examples: "말티즈, 포메라니안, 치와와", time: "1시간 30분 ~ 2시간", color: "bg-[#D1FAE5] text-[#065F46]" },
  { type: "중형견", examples: "스피츠, 코커스패니얼, 웰시코기", time: "2시간 ~ 2시간 30분", color: "bg-[#DBEAFE] text-[#1D4ED8]" },
  { type: "대형견", examples: "골든리트리버, 스탠다드 푸들", time: "2시간 30분 ~ 3시간", color: "bg-[#F3E8FF] text-[#5B21B6]" },
  { type: "털 엉킴 심한 경우", examples: "견종 무관", time: "+ 30분 ~ 1시간 추가", color: "bg-[#FEF9C3] text-[#92400E]" },
];

// ─────────────────────────────────────────────
// 9. 견종 목록 (접수 폼에서 사용)
// ─────────────────────────────────────────────
export const BREEDS = [
  "말티즈", "푸들", "포메라니안", "비숑프리제", "시추", "요크셔테리어",
  "골든리트리버", "래브라도", "진돗개", "웰시코기", "불독", "기타",
];

// ─────────────────────────────────────────────
// 10. 홈 화면 — 기능 소개 카드 (선택 수정)
// ─────────────────────────────────────────────
export const FEATURES = [
  {
    emoji: "📱",
    title: "실시간 진행 알림",
    desc: "목욕→드라이→커트 단계별로 보호자에게 자동 안내",
  },
  {
    emoji: "🖼️",
    title: "미용 완료 사진 전송",
    desc: "완료 후 사진을 첨부하면 보호자 화면에 즉시 표시",
  },
  {
    emoji: "📋",
    title: "요청사항 디지털 접수",
    desc: "구두 전달 없이 보호자가 직접 입력, 누락 제로",
  },
  {
    emoji: "⭐",
    title: "리뷰 유도 자동화",
    desc: "완료 화면에서 네이버·카카오 리뷰로 바로 연결",
  },
];
