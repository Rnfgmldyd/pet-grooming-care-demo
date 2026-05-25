# Pet Grooming Care Demo - TODO

## 핵심 기능

- [x] DB 스키마: appointments 테이블 (전체 접수 이력 저장)
- [x] DB 스키마: staff_settings 테이블 (직원 4자리 비밀번호 저장)
- [x] DB 마이그레이션 실행 (webdev_execute_sql로 직접 생성)
- [x] 서버: staff 라우터 - 비밀번호 검증 (verifyPin)
- [x] 서버: staff 라우터 - 비밀번호 설정 (setPin)
- [x] 서버: appointments 라우터 - 접수 등록 (create) - 직원/보호자 공용
- [x] 서버: appointments 라우터 - 목록 조회 (listAll) - 전체 이력
- [x] 서버: appointments 라우터 - 단건 조회 (getById) - 보호자 상태 확인
- [x] 서버: appointments 라우터 - 상태 변경 (updateStatus) - 직원 전용
- [x] 서버: appointments 라우터 - listActive (오늘 진행 중 포함)
- [x] 프론트: 직원 로그인 페이지 (4자리 PIN 입력, 자동 포커스, 자동 제출)
- [x] 프론트: 직원 화면에 PIN 인증 게이트 추가 (서버 쿠키 기반)
- [x] 프론트: 접수 화면 - 직원/보호자 공용 동작 (source 필드로 구분)
- [x] 프론트: 접수 이력 페이지 - 전체 이력 조회 (검색/필터/날짜 필터)
- [x] 프론트: StatusPage DB 연동 (tRPC getById)
- [x] 프론트: StaffPage DB 연동 (tRPC listActive, updateStatus)
- [x] 프론트: HistoryPage PIN 인증 게이트 추가
- [x] App.tsx: /staff-login, /history 라우트 추가
- [x] 테스트: staff PIN 인증 테스트 (20개 테스트 통과)
- [x] 테스트: appointments CRUD 테스트 (20개 테스트 통과)

## SaaS 전환 (그루밍노트)

- [x] DB 스키마: shops 테이블 (멀티테넌트 매장 관리)
- [x] DB 스키마: appointments에 shopId 컬럼 추가
- [x] DB 마이그레이션 실행 (pnpm db:push)
- [x] 서버: shop 라우터 - 매장 가입 (register), 슬러그 중복 확인 (checkSlug)
- [x] 서버: shop 라우터 - 현재 매장 조회 (current)
- [x] 서버: admin 라우터 - 전체 매장 목록 (listShops), 활성화 토글 (toggleShop), 플랜 변경 (updatePlan)
- [x] 서버: staff 라우터 shopId 기반으로 전환 (쿠키 기반 매장 식별)
- [x] 서버: appointments 라우터 shopId 기반 멀티테넌트 격리
- [x] 프론트: ShopContext - 현재 매장 정보 전역 제공
- [x] 프론트: RegisterPage - 매장 가입 페이지 (슬러그 실시간 중복 확인)
- [x] 프론트: AdminPage - 슈퍼 어드민 (전체 매장 목록, 플랜/활성화 관리)
- [x] 프론트: Home.tsx - 그루밍노트 SaaS 랜딩 페이지 (기능 소개, 요금제, FAQ)
- [x] App.tsx: /register, /admin 라우트 추가
- [x] 테스트: SaaS 멀티테넌트 테스트 (24개 테스트 통과)
- [x] 테스트: 전체 46개 테스트 통과

## 버그 수정

- [x] 버그: RegisterPage에서 존재하지 않는 도메인(grooминgnote.com) 하드코딩 → window.location.origin 기반으로 수정
- [x] 버그: 가입 완료 후 바로 /staff-login으로 이동하여 사용자가 링크 확인 불가 → 가입 완료 화면(성공 스텝)으로 변경, 직원 로그인 링크 복사 기능 제공
- [x] 버그: StaffLoginPage에서 SHOP 하드코딩 → useShop()으로 실제 매장명 표시
- [x] 버그: StaffPage에서 SHOP 하드코딩 → useShop()으로 실제 매장명 표시
