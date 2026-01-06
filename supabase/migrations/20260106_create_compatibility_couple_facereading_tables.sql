-- 직장 궁합 결과 저장 테이블
-- 두 사람의 생년월일시 데이터와 궁합 분석 결과를 저장

CREATE TABLE IF NOT EXISTS compatibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 첫 번째 사람 정보
  p1_name VARCHAR(100) NOT NULL,
  p1_birth_year INT NOT NULL,
  p1_birth_month INT NOT NULL,
  p1_birth_day INT NOT NULL,
  p1_birth_hour INT NOT NULL,
  p1_birth_minute INT NOT NULL,
  p1_gender VARCHAR(10) NOT NULL,
  p1_is_lunar BOOLEAN NOT NULL DEFAULT FALSE,

  -- 두 번째 사람 정보
  p2_name VARCHAR(100) NOT NULL,
  p2_birth_year INT NOT NULL,
  p2_birth_month INT NOT NULL,
  p2_birth_day INT NOT NULL,
  p2_birth_hour INT NOT NULL,
  p2_birth_minute INT NOT NULL,
  p2_gender VARCHAR(10) NOT NULL,
  p2_is_lunar BOOLEAN NOT NULL DEFAULT FALSE,

  -- 관계 유형 및 결과
  relation_type VARCHAR(50) NOT NULL,
  result_data JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 사용자 + 동일 두 사람 + 동일 관계 유형에 대해 중복 방지
  CONSTRAINT unique_compatibility_result UNIQUE (
    user_id,
    p1_birth_year, p1_birth_month, p1_birth_day, p1_birth_hour, p1_birth_minute, p1_gender, p1_is_lunar,
    p2_birth_year, p2_birth_month, p2_birth_day, p2_birth_hour, p2_birth_minute, p2_gender, p2_is_lunar,
    relation_type
  )
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_compatibility_results_user_id ON compatibility_results(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_results_created_at ON compatibility_results(user_id, created_at DESC);

-- RLS 정책
ALTER TABLE compatibility_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compatibility results"
  ON compatibility_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compatibility results"
  ON compatibility_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compatibility results"
  ON compatibility_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own compatibility results"
  ON compatibility_results FOR DELETE
  USING (auth.uid() = user_id);


-- 연인 궁합 결과 저장 테이블
-- 구조는 compatibility_results와 동일하지만 별도 테이블로 관리

CREATE TABLE IF NOT EXISTS couple_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 첫 번째 사람 정보
  p1_name VARCHAR(100) NOT NULL,
  p1_birth_year INT NOT NULL,
  p1_birth_month INT NOT NULL,
  p1_birth_day INT NOT NULL,
  p1_birth_hour INT NOT NULL,
  p1_birth_minute INT NOT NULL,
  p1_gender VARCHAR(10) NOT NULL,
  p1_is_lunar BOOLEAN NOT NULL DEFAULT FALSE,

  -- 두 번째 사람 정보
  p2_name VARCHAR(100) NOT NULL,
  p2_birth_year INT NOT NULL,
  p2_birth_month INT NOT NULL,
  p2_birth_day INT NOT NULL,
  p2_birth_hour INT NOT NULL,
  p2_birth_minute INT NOT NULL,
  p2_gender VARCHAR(10) NOT NULL,
  p2_is_lunar BOOLEAN NOT NULL DEFAULT FALSE,

  -- 관계 유형 및 결과
  relation_type VARCHAR(50) NOT NULL,
  result_data JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 사용자 + 동일 두 사람 + 동일 관계 유형에 대해 중복 방지
  CONSTRAINT unique_couple_result UNIQUE (
    user_id,
    p1_birth_year, p1_birth_month, p1_birth_day, p1_birth_hour, p1_birth_minute, p1_gender, p1_is_lunar,
    p2_birth_year, p2_birth_month, p2_birth_day, p2_birth_hour, p2_birth_minute, p2_gender, p2_is_lunar,
    relation_type
  )
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_couple_results_user_id ON couple_results(user_id);
CREATE INDEX IF NOT EXISTS idx_couple_results_created_at ON couple_results(user_id, created_at DESC);

-- RLS 정책
ALTER TABLE couple_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own couple results"
  ON couple_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own couple results"
  ON couple_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own couple results"
  ON couple_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own couple results"
  ON couple_results FOR DELETE
  USING (auth.uid() = user_id);


-- 관상 분석 결과 저장 테이블
-- 이미지 URL과 분석 결과를 저장

CREATE TABLE IF NOT EXISTS face_reading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  result_data JSONB NOT NULL,
  result_hash VARCHAR(500) NOT NULL, -- 결과 데이터 해시 (중복 방지용)
  image_url TEXT, -- Supabase Storage에 저장된 이미지 URL
  gender VARCHAR(10) NOT NULL DEFAULT 'male',
  label TEXT, -- 사용자가 지정한 라벨 (선택)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 동일 사용자 + 동일 결과 해시에 대해 중복 방지
  CONSTRAINT unique_face_reading_result UNIQUE (user_id, result_hash)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_face_reading_results_user_id ON face_reading_results(user_id);
CREATE INDEX IF NOT EXISTS idx_face_reading_results_created_at ON face_reading_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_face_reading_results_hash ON face_reading_results(user_id, result_hash);

-- RLS 정책
ALTER TABLE face_reading_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own face reading results"
  ON face_reading_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own face reading results"
  ON face_reading_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own face reading results"
  ON face_reading_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own face reading results"
  ON face_reading_results FOR DELETE
  USING (auth.uid() = user_id);


-- updated_at 자동 갱신 함수 (이미 존재하지 않는 경우에만 생성)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 대한 updated_at 자동 갱신 트리거
CREATE TRIGGER trigger_update_compatibility_results_updated_at
  BEFORE UPDATE ON compatibility_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_couple_results_updated_at
  BEFORE UPDATE ON couple_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_face_reading_results_updated_at
  BEFORE UPDATE ON face_reading_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Storage 버킷 생성 (관상 이미지용)
-- 참고: 이 부분은 Supabase 대시보드에서 수동으로 설정해야 할 수 있음
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('face-readings', 'face-readings', true)
-- ON CONFLICT (id) DO NOTHING;
