-- 이미지 첨부 컬럼 추가
ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 이미지 저장용 스토리지 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 스토리지 RLS
CREATE POLICY "Anyone can read review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Anyone can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Anyone can delete review images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'review-images');
