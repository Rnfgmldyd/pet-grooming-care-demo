# 납품 커스텀 가이드

> 이 파일은 납품 시 업체에게 전달하는 설정 가이드입니다.  
> **수정해야 할 파일은 단 하나: `client/src/lib/shop-config.ts`**

---

## 빠른 시작

납품 후 아래 파일 하나만 수정하면 전체 앱이 업데이트됩니다.

```
client/src/lib/shop-config.ts
```

---

## 1. 매장 기본 정보

```ts
export const SHOP = {
  name: "몽몽살롱",          // ← 매장명 (모든 화면에 자동 반영)
  subtitle: "애견미용 전문점",  // ← 부제목
  phone: "010-0000-0000",    // ← 전화번호 (클릭 시 전화 연결)
  address: "서울시 ...",       // ← 주소
  logoEmoji: "🐾",            // ← 로고 이모지
  kakaoUrl: "https://...",    // ← 카카오채널 URL (없으면 빈 문자열)
  naverUrl: "https://...",    // ← 네이버 예약 URL (없으면 빈 문자열)
};
```

---

## 2. 기본 서비스 목록

`BASE_SERVICES` 배열을 수정하면 접수 화면과 스타일 선택 화면에 자동 반영됩니다.

```ts
export const BASE_SERVICES: BaseService[] = [
  {
    id: "bath-dry",
    label: "목욕 + 드라이",
    emoji: "🛁",
    desc: "전신 목욕 및 드라이어 마무리",
    detail: "자세한 설명...",
    time: "1시간",
    price: "3만원~",
    hasCut: false,           // ← false면 컷 선택 단계 건너뜀
    img: "/images/bath.png", // ← 이미지 경로
    bgColor: "bg-[#F0FDF4]",
    borderColor: "border-[#86EFAC]",
  },
  // ... 더 추가 가능
];
```

### 이미지 교체 방법

1. 원하는 이미지를 `client/public/images/` 폴더에 넣습니다.
2. `img` 값을 `/images/파일명.png`로 수정합니다.

---

## 3. 컷 종류 목록

`CUT_TYPES` 배열을 수정하면 컷 선택 화면에 반영됩니다.

```ts
export const CUT_TYPES: CutType[] = [
  {
    id: "teddy",
    label: "곰돌이 컷",
    desc: "둥글고 귀여운 곰돌이 스타일",
    detail: "자세한 설명...",
    tags: ["인기", "소형견"],
    hasScissorStyle: false,  // ← true면 가위컷 세부 선택 단계 추가
    img: "https://...",      // ← 이미지 URL 또는 /images/경로
    bgColor: "bg-[#FFF7ED]",
    borderColor: "border-[#FED7AA]",
  },
  // ... 더 추가 가능
];
```

---

## 4. 가위컷 세부 스타일

`SCISSOR_STYLES` 배열을 수정하면 가위컷 선택 시 세부 스타일 화면에 반영됩니다.

```ts
export const SCISSOR_STYLES: ScissorStyle[] = [
  {
    id: "round",
    label: "라운드 컷",
    desc: "부드럽고 둥근 실루엣",
    detail: "자세한 설명...",
    tags: ["부드러운", "클래식"],
    img: "https://...",
  },
  // ... 더 추가 가능
];
```

---

## 5. 방문 전 안내 항목

`GUIDE_BEFORE` 배열을 수정하면 방문 전 안내 화면에 반영됩니다.

```ts
export const GUIDE_BEFORE = [
  {
    icon: "🏥",
    title: "건강 상태 공유",
    desc: "피부 질환, 귀 염증 등 특이사항은 접수 시 꼭 알려주세요.",
    tag: "필수",  // "필수" | "중요" | "권장" | "참고"
  },
  // ... 더 추가/수정 가능
];
```

---

## 6. 소요 시간 안내표

`TIME_TABLE` 배열을 수정하면 방문 전 안내 화면의 소요 시간 표에 반영됩니다.

```ts
export const TIME_TABLE = [
  { type: "소형견", examples: "말티즈, 포메라니안", time: "1시간 30분 ~ 2시간", color: "bg-[#D1FAE5] text-[#065F46]" },
  // ...
];
```

---

## 7. 미용 후 케어 안내

`AFTER_CARE` 배열을 수정하면 미용 완료 화면의 귀가 후 케어 항목에 반영됩니다.

```ts
export const AFTER_CARE = [
  { icon: "🪮", title: "빗질", desc: "귀가 후 부드럽게 빗질해 주세요." },
  // ...
];
```

---

## 8. 견종 목록

`BREEDS` 배열을 수정하면 접수 화면의 견종 선택 드롭다운에 반영됩니다.

```ts
export const BREEDS = [
  "말티즈", "푸들", "포메라니안", "비숑프리제", "시추",
  // ... 원하는 견종 추가/제거
  "기타"
];
```

---

## 자주 묻는 질문

**Q. 이미지를 직접 찍은 사진으로 바꾸고 싶어요.**  
A. `client/public/images/` 폴더에 사진을 넣고 `shop-config.ts`의 `img` 값을 `/images/파일명.jpg`로 바꾸세요.

**Q. 컷 종류를 추가하고 싶어요.**  
A. `CUT_TYPES` 배열에 새 항목을 추가하면 됩니다. `id`는 고유한 영문 소문자로 지정하세요.

**Q. 서비스 가격을 바꾸고 싶어요.**  
A. `BASE_SERVICES`의 각 항목에서 `price` 값을 수정하세요.

**Q. 전화번호가 잘못 표시돼요.**  
A. `SHOP.phone` 값을 확인하고 `"010-1234-5678"` 형식으로 수정하세요.

---

> 이 외 추가 커스텀이 필요하시면 개발자에게 문의해 주세요.
