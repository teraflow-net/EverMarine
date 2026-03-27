-- Review Comments 테이블: 핀드롭 피드백 시스템
create table if not exists review_comments (
  id uuid default gen_random_uuid() primary key,
  page_url text not null,
  x_percent numeric(5,2) not null,
  y_percent numeric(5,2) not null,
  content text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  author_name text not null default 'Guest',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- 인덱스: 페이지별 코멘트 조회
create index idx_review_comments_page on review_comments (page_url);
create index idx_review_comments_status on review_comments (status);

-- RLS 활성화
alter table review_comments enable row level security;

-- 누구나 읽기 가능 (anon key로 접근)
create policy "Anyone can read comments"
  on review_comments for select
  using (true);

-- 누구나 작성 가능 (게스트 리뷰어 지원)
create policy "Anyone can insert comments"
  on review_comments for insert
  with check (true);

-- 누구나 상태 업데이트 가능 (추후 인증 추가 시 제한)
create policy "Anyone can update comments"
  on review_comments for update
  using (true);

-- Realtime 활성화
alter publication supabase_realtime add table review_comments;
