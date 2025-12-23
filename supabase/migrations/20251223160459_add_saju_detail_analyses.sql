-- 상세 분석 결과 저장 테이블
CREATE TABLE IF NOT EXISTS saju_detail_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint VARCHAR(20) NOT NULL, -- 생년월일+성별 기반 해시
  category VARCHAR(50) NOT NULL, -- dayMaster, career, wealth, relationship, health, tenGods, stars, fortune
  content TEXT NOT NULL, -- 분석 결과 내용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 동일 사용자 + 동일 사주 + 동일 카테고리에 대해 중복 방지
  UNIQUE(user_id, fingerprint, category)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_saju_detail_analyses_user_id ON saju_detail_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_saju_detail_analyses_fingerprint ON saju_detail_analyses(user_id, fingerprint);

-- RLS 정책
ALTER TABLE saju_detail_analyses ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 읽을 수 있음
CREATE POLICY "Users can read own detail analyses" ON saju_detail_analyses
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 데이터만 삽입할 수 있음
CREATE POLICY "Users can insert own detail analyses" ON saju_detail_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 데이터만 수정할 수 있음
CREATE POLICY "Users can update own detail analyses" ON saju_detail_analyses
  FOR UPDATE USING (auth.uid() = user_id);
