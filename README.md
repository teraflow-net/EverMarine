# TradeFlow — B2B 선박부품 견적/발주 관리 시스템

> ERP 프론트엔드 (React + TypeScript + Tailwind)
> 백엔드: [teraflow-net/ERP_Client](https://github.com/teraflow-net/ERP_Client) (Django REST API)
> 프로토타입: [terapixel0505/CRUD_PROTOTYPE](https://github.com/terapixel0505/CRUD_PROTOTYPE)

선박부품(Ship Spare Parts) 중간 유통사를 위한 견적/발주 통합 관리 시스템.

## 비즈니스 플로우

```
End User (고객) → 견적 요청 이메일 (PDF/Excel)
    ↓ 자동 파싱
RFQ 등록 → 업체 견적 요청 → Supplier 회신
    ↓ 마진 산정
고객 견적 제출 → 발주(PO) 수신 → Supplier 발주 발송
    ↓
납기/배송 추적 → 종료
```

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + Inter Font |
| State | Zustand (전역 상태 관리) |
| Routing | React Router v7 |
| Icons | Lucide React |
| PDF 파싱 | pdfjs-dist (브라우저 내) |

## 실행

```bash
npm install
npm run dev
# http://localhost:5173
```

## 프로젝트 구조

```
CRUD_PROTOTYPE/
├── index.html                          # Vite 엔트리 HTML
├── package.json                        # 의존성 및 스크립트
├── vite.config.ts                      # Vite 설정
├── tsconfig.json                       # TypeScript 설정 (루트)
├── tsconfig.app.json                   # TypeScript 설정 (앱)
├── tsconfig.node.json                  # TypeScript 설정 (Node)
├── eslint.config.js                    # ESLint 설정
├── public/
│   ├── favicon.svg                     # 파비콘
│   └── pdf.worker.min.mjs             # PDF.js 워커 (브라우저 파싱용)
└── src/
    ├── main.tsx                        # React 엔트리포인트
    ├── App.tsx                         # 라우터 설정 (React Router v7)
    ├── index.css                       # 글로벌 스타일 (Tailwind)
    ├── types/index.ts                  # 전체 타입 정의
    ├── data/mock.ts                    # Mock 데이터 (선박부품 시나리오)
    ├── lib/
    │   ├── utils.ts                    # cn(), formatDate(), formatCurrency()
    │   └── pdfParser.ts               # PDF 텍스트 추출 + 품목 파싱
    ├── store/useStore.ts              # Zustand 전역 상태 (RFQ, PO, Email)
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.tsx             # Sidebar + Outlet 구조
    │   │   ├── Sidebar.tsx            # Monday.com 스타일 사이드바
    │   │   └── Header.tsx             # 페이지 헤더 + 액션 버튼
    │   ├── ui/
    │   │   └── Badge.tsx              # RFQ/PO 상태 배지
    │   └── rfq/
    │       ├── UploadModal.tsx        # PDF 업로드 → 파싱 → 검토 (3단계)
    │       ├── SupplierRequestModal.tsx  # 업체 견적 요청 모달
    │       ├── CustomerQuoteModal.tsx    # 고객 견적 발송 모달
    │       └── POCreateModal.tsx        # 발주서 생성 모달
    └── pages/
        ├── Dashboard.tsx              # KPI 카드 4개 + 최근 RFQ 테이블
        ├── RFQList.tsx                # 상태별 필터 + 검색 + 테이블
        ├── RFQDetail.tsx              # 4탭 (요청/견적비교/제출/이메일)
        ├── POList.tsx                 # 발주 목록
        ├── PODetail.tsx               # 발주 상세 + 품목 + 이메일
        ├── EmailCenter.tsx            # 수신/발신 이메일 통합
        ├── Customers.tsx              # 고객사 CRUD
        ├── Suppliers.tsx              # 공급사 CRUD
        ├── Parts.tsx                  # 품목 마스터 + 마진율
        └── Settings.tsx               # 마진율/이메일 설정
```

## 현재 구현 완료 (Phase 1)

### 화면 및 레이아웃
- [x] Monday.com 스타일 사이드바 (섹션 라벨: 업무/마스터/시스템)
- [x] 페이지별 헤더 + 상태별 액션 버튼
- [x] Linear/Notion 스타일 데이터 테이블
- [x] 대시보드 KPI 카드 4개

### RFQ (견적) 관리
- [x] 목록: 상태별 필터 탭 + 텍스트 검색
- [x] 상세: 4탭 구조 (고객요청 / 업체견적비교 / 견적제출 / 이메일로그)
- [x] 업체 견적 비교: 품목별 Supplier 단가 나란히 비교, 최저가 표시
- [x] 마진 산정: 프리셋 버튼(20~40%) + 직접입력, 합계 자동 계산

### 액션 모달 + 상태 전환 (Zustand 연동)
- [x] 업체 견적 요청: 공급사 선택 + 이메일 미리보기 → status: quoted_supplier
- [x] 고객 견적 발송: 금액 요약 + 이메일 미리보기 → status: quoted_customer
- [x] 발주서 생성: 공급사 선택 + PO 자동 번호 → PO 생성 + status: ordered
- [x] 모든 액션 시 이메일 로그 자동 기록

### PDF 업로드 파싱
- [x] 드래그앤드롭 / 클릭 업로드
- [x] PDF 캔버스 미리보기 (1페이지)
- [x] 텍스트 추출 → 품번/수량/단위 패턴 파싱 (3패턴)
- [x] 파싱 결과 편집 테이블 (신뢰도 표시)
- [x] 확인 → RFQ 자동 등록

### 발주(PO) 관리
- [x] 목록 + 상세 (발주 정보 + 공급사 정보 + 품목 테이블)
- [x] 상태 전환 버튼: 발송 → 확인 → 납품완료

### 부가 기능
- [x] 이메일 센터: 수신/발신 통합 뷰 + RFQ/PO 연결
- [x] 고객사 / 공급사 / 품목 마스터 테이블
- [x] 설정: 카테고리별 마진율 + 이메일 서버 설정

## 다음 구현 예정 (TODO)

### Phase 2 — Vercel 배포 + 리뷰 모드 (Supabase) ✅

#### 2-1. Vercel 배포 ✅
- [x] Vercel 프로젝트 연결 + 환경변수 설정
- [x] 프로덕션 URL: https://crud-prototype.vercel.app

#### 2-2. Supabase 셋업 ✅
- [x] `review_comments` 테이블 (id, page_url, x/y_percent, content, status, author_name, image_url, created_at, resolved_at)
- [x] RLS 정책 + Realtime 활성화
- [x] `review-images` Storage 버킷 (이미지 업로드용)

#### 2-3. 리뷰 모드 프론트엔드 ✅
- [x] `ReviewToggle.tsx` — 리뷰 모드 ON/OFF 토글 (우하단 버튼)
- [x] `PinLayer.tsx` — 클릭 → % 좌표 캡처 → 핀 렌더링 + Realtime 구독
- [x] `CommentPopover.tsx` — 코멘트 작성 + 이미지 업로드 (Supabase Storage)
- [x] `ReviewPanel.tsx` — 우측 사이드 패널 (미처리/완료 탭 + 페이지별 그룹핑)

#### 2-4. 이력 관리 ✅
- [x] 코멘트 상태 전환 (open → in_progress → resolved)
- [x] 완료 숨김/표시 토글
- [x] 사이드 패널에서 전체 페이지 피드백 취합 (페이지 URL 표시)
- [x] 패널에서 코멘트 클릭 → 해당 페이지로 이동 + 핀 포커스

#### 참고: SaaS 대안 (직접 구현 대신 사용 가능)
> - **MarkUp.io** — Proxy 방식, URL 공유만으로 사용, 무료 티어 (SPA 호환 주의)
> - **BugHerd** — JS snippet, SPA 완벽 호환, 칸반 내장 (~$41/mo)
> - **Marker.io** — JS snippet, GitHub Issues/Linear 직접 연동 (~$39/mo)
>
> 판단: Supabase 직접 구현 채택. 범용화 계획은 [REVIEW_KIT.md](./REVIEW_KIT.md) 참고.

### Phase 3 — 인라인 편집 + UX 개선
- [ ] RFQ 고객사 연결 (PDF 업로드 후 고객사 지정)
- [ ] 테이블 인라인 편집 (고객사/공급사/품목 추가/수정/삭제)
- [ ] RFQ 상세에서 공급사 선택 인라인 처리
- [ ] 마진율 조정 시 판매단가 실시간 재계산
- [ ] 반응형 레이아웃 (태블릿 대응)

### Phase 4 — 백엔드 연동
- [ ] DB 스키마 설계 (PostgreSQL + Prisma)
- [ ] REST API (OpenAPI 스펙)
- [ ] CRUD API 구현 (Node.js / Fastify)
- [ ] 서버사이드 PDF 파싱
- [ ] 이메일 연동 (IMAP 수신 + SMTP 발신)

### Phase 5 — 자동화
- [ ] 이메일 자동 수신 → 파싱 → RFQ 자동 생성
- [ ] LLM 기반 비정형 문서 파싱
- [ ] 가격 이력 기반 자동 견적 산정 엔진
- [ ] 알림 시스템 (SLA 초과 경고)

## 디자인 시스템

| 항목 | 값 |
|------|-----|
| 폰트 | Inter |
| Primary | #0369A1 (sky-600) |
| Text | #0F172A (slate-900) |
| Muted | #64748B (slate-500) |
| Background | #F8FAFC (slate-50) |
| Border | #E2E8F0 (slate-200) |
| 스타일 | Flat (그림자 없음) |
