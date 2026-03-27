# Review Kit — 백엔드 API 스펙

> 피드백 Kit을 Django 등 자체 백엔드로 구축할 때 참고.
> 현재 Supabase(프로토타입)에서 검증된 데이터 구조와 액션을 기반으로 정리.

---

## 1. 데이터 모델 (DB 테이블)

### review_comments (핵심 테이블)

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | UUID | PK | auto | 코멘트 고유 ID |
| `project_id` | VARCHAR(100) | ✅ | — | 프로젝트 식별자 (범용화 시 필수) |
| `page_url` | TEXT | ✅ | — | 코멘트가 남겨진 페이지 경로 (예: `/rfq`, `/po/123`) |
| `x_percent` | DECIMAL(5,2) | ✅ | — | 핀 X 좌표 (뷰포트 대비 %, 0~100) |
| `y_percent` | DECIMAL(5,2) | ✅ | — | 핀 Y 좌표 (뷰포트 대비 %, 0~100) |
| `content` | TEXT | ✅ | — | 코멘트 본문 |
| `status` | VARCHAR(20) | ✅ | `'open'` | 상태: `open` / `in_progress` / `resolved` |
| `author_name` | VARCHAR(100) | ✅ | `'Guest'` | 작성자 이름 (비로그인 게스트 지원) |
| `image_url` | TEXT | ❌ | NULL | 첨부 이미지 URL (Storage에 업로드 후 URL 저장) |
| `github_issue_number` | INTEGER | ❌ | NULL | 연동된 GitHub Issue 번호 (Phase A) |
| `created_at` | TIMESTAMPTZ | ✅ | now() | 생성 시각 |
| `resolved_at` | TIMESTAMPTZ | ❌ | NULL | 완료 처리 시각 |

**인덱스:**
- `idx_project_page` → (`project_id`, `page_url`) — 페이지별 코멘트 조회
- `idx_status` → (`status`) — 상태별 필터링

### review_images (파일 스토리지)

이미지는 별도 파일 스토리지(S3, Supabase Storage 등)에 저장하고 URL만 DB에 기록.

| 항목 | 값 |
|------|-----|
| 저장 경로 | `review-images/{timestamp}-{random}.{ext}` |
| 접근 권한 | Public read (URL로 직접 접근 가능) |
| 허용 포맷 | image/* (png, jpg, gif, webp, svg) |
| 최대 크기 | 10MB (권장) |

---

## 2. 유저 액션 → API 매핑

### 2-1. 코멘트 등록 (핀드롭)

**트리거:** 리뷰 모드에서 화면 클릭 → 이름/코멘트 입력 → **"등록" 버튼**

```
POST /api/review/comments/

Request Body:
{
  "project_id": "tradeflow",
  "page_url": "/rfq",
  "x_percent": 42.55,
  "y_percent": 23.07,
  "content": "로고를 여기에 삽입해주세요",
  "author_name": "홍길동",
  "image_url": "https://storage.../review-images/1711234567-abc.png"  // optional
}

Response: 201 Created
{
  "id": "c7ee0a6a-...",
  "status": "open",
  "created_at": "2026-03-27T02:00:17Z",
  ...
}
```

**수집 데이터:**
| 필드 | 출처 |
|------|------|
| `page_url` | React Router `useLocation().pathname` (자동) |
| `x_percent` | 클릭 좌표 / 뷰포트 너비 × 100 (자동) |
| `y_percent` | 클릭 좌표 / 뷰포트 높이 × 100 (자동) |
| `content` | 사용자 입력 (textarea) |
| `author_name` | 사용자 입력 (localStorage 캐시) |
| `image_url` | 이미지 업로드 후 반환된 URL (선택) |

---

### 2-2. 이미지 업로드

**트리거:** 코멘트 작성 폼에서 **"이미지" 버튼** → 파일 선택

```
POST /api/review/upload/

Request: multipart/form-data
  file: (binary image)

Response: 200 OK
{
  "url": "https://storage.../review-images/1711234567-abc.png"
}
```

**흐름:** 이미지 업로드 → URL 받기 → 코멘트 등록 시 `image_url`에 포함

---

### 2-3. 상태 변경

**트리거:** 핀 클릭 → 팝오버에서 상태 버튼 클릭

| 버튼 | 현재 상태 | 변경 후 | 추가 필드 업데이트 |
|------|-----------|---------|-------------------|
| **"진행중"** | `open` | `in_progress` | — |
| **"완료"** | `open` 또는 `in_progress` | `resolved` | `resolved_at` = now() |
| **"다시 열기"** | `resolved` | `open` | `resolved_at` = NULL |

```
PATCH /api/review/comments/{id}/

Request Body:
{
  "status": "resolved",
  "resolved_at": "2026-03-27T03:15:00Z"  // resolved일 때만
}

Response: 200 OK
```

---

### 2-4. 코멘트 삭제

**트리거:** 핀 클릭 → 팝오버에서 **휴지통 아이콘** 클릭

```
DELETE /api/review/comments/{id}/

Response: 204 No Content
```

---

### 2-5. 코멘트 목록 조회 (현재 페이지)

**트리거:** 리뷰 모드 활성화 시 자동 로드 (페이지별)

```
GET /api/review/comments/?project_id=tradeflow&page_url=/rfq&ordering=created_at

Response: 200 OK
[
  {
    "id": "c7ee0a6a-...",
    "page_url": "/rfq",
    "x_percent": 42.55,
    "y_percent": 23.07,
    "content": "로고를 여기에 삽입해주세요",
    "status": "open",
    "author_name": "홍길동",
    "image_url": "https://...",
    "created_at": "2026-03-27T02:00:17Z",
    "resolved_at": null
  },
  ...
]
```

---

### 2-6. 전체 코멘트 목록 조회 (사이드 패널)

**트리거:** 상단 바 **"피드백 목록" 버튼** 클릭

```
GET /api/review/comments/?project_id=tradeflow&ordering=-created_at

Response: 200 OK
[
  // 모든 페이지의 코멘트 (page_url 포함)
]
```

**프론트엔드에서 그룹핑:**
- `page_url` 기준 그룹핑
- 탭 필터: 미처리/진행중 (`status != 'resolved'`) vs 완료 (`status == 'resolved'`)

---

### 2-7. 실시간 동기화 (WebSocket)

**트리거:** 다른 사용자가 코멘트 등록/수정/삭제 시 실시간 반영

```
WS /ws/review/comments/?project_id=tradeflow&page_url=/rfq

Server → Client 메시지:
{
  "event": "INSERT" | "UPDATE" | "DELETE",
  "record": { ... }  // 변경된 코멘트 데이터
}
```

**Django 구현 옵션:**
- Django Channels (WebSocket)
- SSE (Server-Sent Events) — 더 간단
- Polling (5초 간격) — 가장 간단하지만 비효율

---

## 3. API 엔드포인트 요약

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| `GET` | `/api/review/comments/` | 코멘트 목록 (필터: project_id, page_url, status) | 없음 (Public) |
| `POST` | `/api/review/comments/` | 코멘트 등록 | 없음 (Guest) |
| `PATCH` | `/api/review/comments/{id}/` | 상태 변경 | 없음 (추후 인증 추가) |
| `DELETE` | `/api/review/comments/{id}/` | 코멘트 삭제 | 없음 (추후 인증 추가) |
| `POST` | `/api/review/upload/` | 이미지 업로드 | 없음 |
| `WS` | `/ws/review/comments/` | 실시간 동기화 | 없음 |

---

## 4. Django 모델 예시

```python
# models.py
from django.db import models
import uuid

class ReviewComment(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', '미처리'
        IN_PROGRESS = 'in_progress', '진행중'
        RESOLVED = 'resolved', '완료'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_id = models.CharField(max_length=100, db_index=True)
    page_url = models.TextField()
    x_percent = models.DecimalField(max_digits=5, decimal_places=2)
    y_percent = models.DecimalField(max_digits=5, decimal_places=2)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    author_name = models.CharField(max_length=100, default='Guest')
    image_url = models.TextField(blank=True, null=True)
    github_issue_number = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['project_id', 'page_url']),
            models.Index(fields=['status']),
        ]
```

---

## 5. 상태 전이 다이어그램

```
        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  │
     [open] ──"진행중"──▶ [in_progress]    │
        │                      │           │
        │     "완료"           │ "완료"     │ "다시 열기"
        │         │            │           │
        ▼         ▼            ▼           │
        └───▶ [resolved] ─────────────────┘
```

---

## 6. 프론트엔드 → 백엔드 전환 시 변경점

현재 Supabase 직접 호출 → Django REST API로 교체 시:

| 현재 (Supabase) | 변경 후 (Django) |
|-----------------|-----------------|
| `supabase.from('review_comments').select(...)` | `fetch('/api/review/comments/?...')` |
| `supabase.from('review_comments').insert(...)` | `fetch('/api/review/comments/', { method: 'POST', body: ... })` |
| `supabase.from('review_comments').update(...)` | `fetch('/api/review/comments/{id}/', { method: 'PATCH', body: ... })` |
| `supabase.from('review_comments').delete()` | `fetch('/api/review/comments/{id}/', { method: 'DELETE' })` |
| `supabase.storage.from('review-images').upload(...)` | `fetch('/api/review/upload/', { method: 'POST', body: formData })` |
| Supabase Realtime (WebSocket) | Django Channels / SSE / Polling |
| `src/lib/supabase.ts` | `src/lib/api.ts` (API client 교체) |

**핵심:** `src/lib/supabase.ts` 하나만 `src/lib/api.ts`로 교체하면 프론트엔드 컴포넌트는 그대로 사용 가능.
이를 위해 범용화 시 데이터 레이어를 인터페이스로 추상화하는 것이 권장됨.

---

## 7. 추후 확장 필드 (GitHub Issues 연동 시)

| 필드 | 타입 | 용도 |
|------|------|------|
| `github_issue_number` | INTEGER | 연동된 Issue 번호 |
| `github_issue_url` | TEXT | Issue 직접 링크 |
| `assignee` | VARCHAR(100) | 담당자 (GitHub assignee) |
| `screenshot_url` | TEXT | 자동 스크린샷 (html2canvas) |
| `viewport_width` | INTEGER | 코멘트 작성 시 뷰포트 너비 (반응형 디버깅) |
| `viewport_height` | INTEGER | 코멘트 작성 시 뷰포트 높이 |
| `browser_info` | TEXT | User-Agent (디버깅용) |
