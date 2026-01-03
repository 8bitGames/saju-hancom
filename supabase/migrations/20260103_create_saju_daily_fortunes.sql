-- 오늘의 운세 저장 테이블
-- 사용자의 일일 운세 결과를 캐싱하여 AI 재생성 비용 절감

CREATE TABLE IF NOT EXISTS saju_daily_fortunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saju_result_id UUID NOT NULL REFERENCES saju_results(id) ON DELETE CASCADE,
  fortune_date DATE NOT NULL,
  fortune_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 같은 사주 결과의 같은 날짜에 대한 운세는 하나만 존재
  CONSTRAINT unique_daily_fortune UNIQUE (user_id, saju_result_id, fortune_date)
);

-- 인덱스
CREATE INDEX idx_daily_fortunes_user_date ON saju_daily_fortunes(user_id, fortune_date);
CREATE INDEX idx_daily_fortunes_saju_result ON saju_daily_fortunes(saju_result_id);

-- RLS 정책
ALTER TABLE saju_daily_fortunes ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 운세만 조회/수정 가능
CREATE POLICY "Users can view own daily fortunes"
  ON saju_daily_fortunes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily fortunes"
  ON saju_daily_fortunes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily fortunes"
  ON saju_daily_fortunes FOR UPDATE
  USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_daily_fortune_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_fortune_updated_at
  BEFORE UPDATE ON saju_daily_fortunes
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_fortune_updated_at();
