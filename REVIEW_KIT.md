# Review Kit — 범용 핀드롭 피드백 시스템

> 모든 웹 프로젝트에 리뷰 모드를 추가하기 위한 범용화 계획.
> TradeFlow CRUD_PROTOTYPE에서 검증된 구현을 기반으로 확장.

## 관련 문서
- [REVIEW_KIT_BACKEND.md](./REVIEW_KIT_BACKEND.md) — 백엔드 API 스펙 (DB 모델, 액션별 필드, Django 예시)

## 현재 상태 (TradeFlow에서 검증 완료)

| 기능 | 상태 |
|------|------|
| 핀드롭 코멘트 (% 좌표) | ✅ 구현 |
| 코멘트 상태 관리 (open → in_progress → resolved) | ✅ 구현 |
| 이미지 첨부 (Supabase Storage) | ✅ 구현 |
| Realtime 동기화 | ✅ 구현 |
| 사이드 패널 (탭 + 페이지별 그룹) | ✅ 구현 |
| GitHub Issues 연동 | 🔲 미구현 |
| NPM 패키지 / JS snippet 범용화 | 🔲 미구현 |

---

## Phase A — GitHub Issues 연동

### 목표
코멘트 등록 시 GitHub Issue 자동 생성 → VS Code에서 작업 관리 → Issue close 시 코멘트 resolved 동기화

### 구현 항목

#### A-1. 코멘트 → GitHub Issue 자동 생성
- [ ] GitHub App 또는 Personal Access Token 설정
- [ ] 코멘트 등록 시 GitHub Issue 생성 API 호출
- [ ] Issue body 포맷:
  ```markdown
  ## 리뷰 피드백
  - **페이지:** /rfq (견적 관리)
  - **위치:** x: 42.5%, y: 23.1%
  - **작성자:** 홍길동
  - **내용:** 로고를 여기에 삽입해주세요
  - **첨부:** ![image](https://...supabase.co/storage/...)
  - **리뷰 ID:** c7ee0a6a-dd65-405d-89bb-a7fc78670129
  ```
- [ ] Label 자동 부여: `review-feedback`, 페이지별 label (`page:/rfq`)
- [ ] `review_comments` 테이블에 `github_issue_number` 컬럼 추가

#### A-2. 양방향 상태 동기화
- [ ] Supabase에서 상태 변경 → GitHub Issue open/closed 동기화
- [ ] GitHub Issue close → Supabase Webhook → 코멘트 resolved 처리
- [ ] Supabase Edge Function 또는 Vercel API Route로 Webhook 수신

#### A-3. VS Code 워크플로우
- [ ] GitHub Issues 확장에서 `review-feedback` label 필터
- [ ] Issue에서 브랜치 생성 → 수정 → PR → Issue 자동 close
- [ ] PR description에 리뷰 ID 참조 → 코멘트 자동 resolved

### 기술 스택
```
Supabase Edge Function (Webhook 수신)
  ↕ 양방향 동기화
GitHub Issues API (v3 REST)
  ↕
VS Code GitHub Issues Extension
```

---

## Phase B — NPM 패키지 범용화

### 목표
어떤 웹 프로젝트든 코드 한 줄로 리뷰 모드 추가 가능

### 배포 형태 2가지

#### B-1. React 컴포넌트 (NPM 패키지)
```bash
npm install @terapixel/review-kit
```
```tsx
// 어떤 React 프로젝트든
import { ReviewProvider } from '@terapixel/review-kit'

function App() {
  return (
    <ReviewProvider
      supabaseUrl={import.meta.env.VITE_SUPABASE_URL}
      supabaseKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
      projectId="client-project-name"
      github={{ repo: "terapixel0505/client-project", token: "..." }}
    >
      <YourApp />
    </ReviewProvider>
  )
}
```

#### B-2. JS Snippet (비React / WordPress / 정적 사이트)
```html
<!-- index.html 또는 wp header에 추가 -->
<script
  src="https://review-kit.vercel.app/widget.js"
  data-supabase-url="https://xxx.supabase.co"
  data-supabase-key="eyJ..."
  data-project-id="client-website"
  data-github-repo="terapixel0505/client-website"
></script>
```

### 구현 항목
- [ ] `src/components/review/` 를 독립 패키지로 추출
- [ ] React peer dependency로 분리
- [ ] `ReviewProvider` 래퍼 컴포넌트 (설정 주입)
- [ ] Vanilla JS widget 빌드 (Vite library mode)
- [ ] 프로젝트별 Supabase 테이블 자동 생성 CLI (`npx review-kit init`)
- [ ] NPM 퍼블리시 + CDN 배포 (unpkg / jsdelivr)

### 패키지 구조
```
@terapixel/review-kit/
├── src/
│   ├── components/
│   │   ├── PinLayer.tsx
│   │   ├── CommentPopover.tsx
│   │   ├── ReviewPanel.tsx
│   │   └── ReviewToggle.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── github.ts         # GitHub Issues API
│   ├── ReviewProvider.tsx     # 설정 Context
│   ├── widget.ts              # Vanilla JS 엔트리
│   └── index.ts               # React 엔트리
├── cli/
│   └── init.ts                # DB 테이블 자동 생성
├── package.json
└── vite.config.ts             # library mode 빌드
```

---

## Phase C — 고급 기능 (선택)

- [ ] 스크린샷 자동 캡처 (html2canvas) → Issue에 첨부
- [ ] 코멘트 스레드 (답글)
- [ ] 작업자 할당 (GitHub assignee 연동)
- [ ] Slack/Discord 알림 (새 코멘트 시)
- [ ] 프로젝트별 대시보드 (전체 피드백 현황 한눈에)
- [ ] 반응형 좌표 보정 (모바일/데스크톱 뷰포트 차이)

---

## 데이터 모델 (범용)

```sql
review_comments (
  id              uuid primary key,
  project_id      text not null,        -- 프로젝트 식별자 (범용화 시 추가)
  page_url        text not null,
  x_percent       numeric(5,2) not null,
  y_percent       numeric(5,2) not null,
  content         text not null,
  status          text not null default 'open',
  author_name     text not null,
  image_url       text,
  github_issue_number integer,          -- GitHub Issue 번호
  created_at      timestamptz default now(),
  resolved_at     timestamptz
)
```

---

## 우선순위

| 순서 | 항목 | 효과 |
|------|------|------|
| 1 | GitHub Issues 연동 (Phase A) | VS Code에서 피드백 → 작업 → PR 워크플로우 완성 |
| 2 | NPM 패키지 추출 (Phase B-1) | React 프로젝트 즉시 적용 |
| 3 | JS Snippet (Phase B-2) | WordPress 등 비React 프로젝트 적용 |
| 4 | 고급 기능 (Phase C) | 필요에 따라 선택 구현 |
