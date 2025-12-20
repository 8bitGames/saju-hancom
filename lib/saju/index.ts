/**
 * 사주팔자 모듈 메인 엔트리
 * AI 운세 마스터 - Saju Module
 */

// Types
export type {
  Gan,
  Zhi,
  Element,
  YinYang,
  Gender,
  TenGod,
  TenGodInfo,
  SajuInput,
  Pillar,
  ElementScores,
  ElementAnalysis,
  TenGodPosition,
  TenGodAnalysis,
  TenGodSummary,
  Star,
  StarType,
  MajorFortune,
  MajorFortunePeriod,
  SajuMeta,
  SajuResult,
  SajuPromptData,
} from "./types";

// Calculator (main function)
export {
  calculateSaju,
  toPromptData,
  summarizeSaju,
  parseGanZhi,
} from "./calculator";

// Solar Time
export {
  adjustToTrueSolarTime,
  getLongitudeByCity,
  formatSolarTimeDescription,
  extractDateParts,
  createDate,
} from "./solar-time";

// Elements
export {
  calculateElementScores,
  analyzeElements,
  formatElementScores,
  formatElementAnalysis,
  getElementFromStem,
  getElementFromBranch,
  getHiddenStemsFromBranch,
} from "./elements";

// Ten Gods
export {
  getTenGodRelation,
  getTenGodForBranch,
  calculateTenGods,
  summarizeTenGods,
  formatTenGodAnalysis,
  formatTenGodSummary,
  getTenGodDescription,
} from "./ten-gods";

// Stars
export {
  calculateStars,
  formatStars,
  getAuspiciousStars,
  getInauspiciousStars,
} from "./stars";

// Constants
export {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_KOREAN,
  STEM_ELEMENTS,
  STEM_YIN_YANG,
  STEM_DESCRIPTIONS,
  BRANCH_KOREAN,
  BRANCH_ANIMALS,
  BRANCH_ELEMENTS,
  BRANCH_YIN_YANG,
  BRANCH_HIDDEN_STEMS,
  ELEMENTS,
  ELEMENT_KOREAN,
  ELEMENT_COLORS,
  ELEMENT_PRODUCES,
  ELEMENT_CONTROLS,
  TEN_GODS,
  TEN_GOD_INFO,
  TEN_GOD_MATRIX,
  HOUR_TO_BRANCH,
  BRANCH_TIME_RANGES,
  SIXTY_JIAZI,
  KOREA_STANDARD_MERIDIAN,
  CITY_LONGITUDES,
  DEFAULT_LONGITUDE,
} from "./constants";

// Pipeline Types
export type {
  SajuAnalysisInput,
  SajuPipelineResult,
  PipelineProgress,
  StepResult,
  StreamingEvent,
  Step1_Foundation,
  Step2_DayMaster,
  Step3_TenGods,
  Step4_SpecialStars,
  Step5_FortuneTiming,
  Step6_Synthesis,
} from "./pipeline-types";

// Pipeline Schemas
export {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  Step6Schema,
} from "./pipeline-schemas";

// Pipeline Steps
export {
  analyzeStep1_Foundation,
  analyzeStep2_DayMaster,
  analyzeStep3_TenGods,
  analyzeStep4_SpecialStars,
  analyzeStep5_FortuneTiming,
  analyzeStep6_Synthesis,
} from "./pipeline-steps";

// Pipeline Orchestrator
export {
  runSajuPipeline,
  runSajuPipelineGenerator,
  runSingleStep,
  PIPELINE_STEPS,
} from "./pipeline-orchestrator";
export type { StepCallback } from "./pipeline-orchestrator";
