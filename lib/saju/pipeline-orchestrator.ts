/**
 * 사주 분석 파이프라인 오케스트레이터
 * 6단계 분석을 순차적으로 실행하고 결과를 축적
 */

import {
  analyzeStep1_Foundation,
  analyzeStep2_DayMaster,
  analyzeStep3_TenGods,
  analyzeStep4_SpecialStars,
  analyzeStep5_FortuneTiming,
  analyzeStep6_Synthesis,
} from "./pipeline-steps";
import type {
  SajuAnalysisInput,
  SajuPipelineResult,
  PipelineProgress,
  StepResult,
  Step1_Foundation,
  Step2_DayMaster,
  Step3_TenGods,
  Step4_SpecialStars,
  Step5_FortuneTiming,
  Step6_Synthesis,
} from "./pipeline-types";
import type {
  Step1Result,
  Step2Result,
  Step3Result,
  Step4Result,
  Step5Result,
  Step6Result,
} from "./pipeline-schemas";

// ============================================================================
// 단계 정보
// ============================================================================

export const PIPELINE_STEPS = [
  {
    step: 1,
    name: "기초 구조 분석",
    description: "사주 원국을 분석하고 있습니다...",
    icon: "🔮",
  },
  {
    step: 2,
    name: "일간 심층 분석",
    description: "일간의 특성을 파악하고 있습니다...",
    icon: "☯️",
  },
  {
    step: 3,
    name: "십성 분석",
    description: "십성의 조화를 분석하고 있습니다...",
    icon: "⭐",
  },
  {
    step: 4,
    name: "신살 분석",
    description: "신살을 해석하고 있습니다...",
    icon: "🌟",
  },
  {
    step: 5,
    name: "대운/세운 분석",
    description: "올해 운세를 살펴보고 있습니다...",
    icon: "📅",
  },
  {
    step: 6,
    name: "종합 분석",
    description: "종합 분석을 완성하고 있습니다...",
    icon: "✨",
  },
] as const;

// ============================================================================
// 콜백 타입
// ============================================================================

export type StepCallback = (
  step: number,
  name: string,
  status: "start" | "complete" | "error",
  data?: unknown,
  error?: string
) => void;

// ============================================================================
// 파이프라인 실행 함수
// ============================================================================

/**
 * 전체 파이프라인 실행 (콜백 기반)
 */
export async function runSajuPipeline(
  input: SajuAnalysisInput,
  onStepUpdate?: StepCallback
): Promise<SajuPipelineResult> {
  const notifyStep = (
    step: number,
    status: "start" | "complete" | "error",
    data?: unknown,
    error?: string
  ) => {
    if (onStepUpdate) {
      const stepInfo = PIPELINE_STEPS[step - 1];
      onStepUpdate(step, stepInfo.name, status, data, error);
    }
  };

  // Step 1: 기초 구조 분석
  notifyStep(1, "start");
  let step1: Step1Result;
  try {
    step1 = await analyzeStep1_Foundation(input);
    notifyStep(1, "complete", step1);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(1, "error", undefined, errorMessage);
    throw new Error(`Step 1 실패: ${errorMessage}`);
  }

  // Step 2: 일간 심층 분석
  notifyStep(2, "start");
  let step2: Step2Result;
  try {
    step2 = await analyzeStep2_DayMaster(input, step1);
    notifyStep(2, "complete", step2);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(2, "error", undefined, errorMessage);
    throw new Error(`Step 2 실패: ${errorMessage}`);
  }

  // Step 3: 십성 분석
  notifyStep(3, "start");
  let step3: Step3Result;
  try {
    step3 = await analyzeStep3_TenGods(input, step1, step2);
    notifyStep(3, "complete", step3);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(3, "error", undefined, errorMessage);
    throw new Error(`Step 3 실패: ${errorMessage}`);
  }

  // Step 4: 신살 분석 (Step 2 이후 병렬 실행 가능하지만 순차로 구현)
  notifyStep(4, "start");
  let step4: Step4Result;
  try {
    step4 = await analyzeStep4_SpecialStars(input, step1);
    notifyStep(4, "complete", step4);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(4, "error", undefined, errorMessage);
    throw new Error(`Step 4 실패: ${errorMessage}`);
  }

  // Step 5: 대운/세운 분석
  notifyStep(5, "start");
  let step5: Step5Result;
  try {
    step5 = await analyzeStep5_FortuneTiming(input, step1, step2);
    notifyStep(5, "complete", step5);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(5, "error", undefined, errorMessage);
    throw new Error(`Step 5 실패: ${errorMessage}`);
  }

  // Step 6: 종합 분석
  notifyStep(6, "start");
  let step6: Step6Result;
  try {
    step6 = await analyzeStep6_Synthesis(input, step1, step2, step3, step4, step5);
    notifyStep(6, "complete", step6);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    notifyStep(6, "error", undefined, errorMessage);
    throw new Error(`Step 6 실패: ${errorMessage}`);
  }

  return {
    step1: step1 as unknown as Step1_Foundation,
    step2: step2 as unknown as Step2_DayMaster,
    step3: step3 as unknown as Step3_TenGods,
    step4: step4 as unknown as Step4_SpecialStars,
    step5: step5 as unknown as Step5_FortuneTiming,
    step6: step6 as unknown as Step6_Synthesis,
  };
}

/**
 * 제너레이터 기반 파이프라인 실행 (스트리밍용)
 */
export async function* runSajuPipelineGenerator(
  input: SajuAnalysisInput
): AsyncGenerator<{
  type: "step_start" | "step_complete" | "step_error" | "pipeline_complete";
  step: number;
  stepName: string;
  stepIcon: string;
  data?: unknown;
  error?: string;
  progress: PipelineProgress;
}> {
  const completedSteps: Array<{ step: number; name: string; summary: string }> = [];

  const createProgress = (currentStep: number): PipelineProgress => ({
    currentStep,
    totalSteps: 6,
    stepName: PIPELINE_STEPS[currentStep - 1]?.name || "",
    stepDescription: PIPELINE_STEPS[currentStep - 1]?.description || "",
    completedSteps: [...completedSteps],
  });

  // Step 1
  yield {
    type: "step_start",
    step: 1,
    stepName: PIPELINE_STEPS[0].name,
    stepIcon: PIPELINE_STEPS[0].icon,
    progress: createProgress(1),
  };

  let step1: Step1Result;
  try {
    step1 = await analyzeStep1_Foundation(input);
    completedSteps.push({
      step: 1,
      name: PIPELINE_STEPS[0].name,
      summary: step1.summary,
    });
    yield {
      type: "step_complete",
      step: 1,
      stepName: PIPELINE_STEPS[0].name,
      stepIcon: PIPELINE_STEPS[0].icon,
      data: step1,
      progress: createProgress(1),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 1,
      stepName: PIPELINE_STEPS[0].name,
      stepIcon: PIPELINE_STEPS[0].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(1),
    };
    throw error;
  }

  // Step 2
  yield {
    type: "step_start",
    step: 2,
    stepName: PIPELINE_STEPS[1].name,
    stepIcon: PIPELINE_STEPS[1].icon,
    progress: createProgress(2),
  };

  let step2: Step2Result;
  try {
    step2 = await analyzeStep2_DayMaster(input, step1);
    completedSteps.push({
      step: 2,
      name: PIPELINE_STEPS[1].name,
      summary: `${step2.dayMasterKorean}, ${step2.bodyStrength}`,
    });
    yield {
      type: "step_complete",
      step: 2,
      stepName: PIPELINE_STEPS[1].name,
      stepIcon: PIPELINE_STEPS[1].icon,
      data: step2,
      progress: createProgress(2),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 2,
      stepName: PIPELINE_STEPS[1].name,
      stepIcon: PIPELINE_STEPS[1].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(2),
    };
    throw error;
  }

  // Step 3
  yield {
    type: "step_start",
    step: 3,
    stepName: PIPELINE_STEPS[2].name,
    stepIcon: PIPELINE_STEPS[2].icon,
    progress: createProgress(3),
  };

  let step3: Step3Result;
  try {
    step3 = await analyzeStep3_TenGods(input, step1, step2);
    completedSteps.push({
      step: 3,
      name: PIPELINE_STEPS[2].name,
      summary: `${step3.structure}`,
    });
    yield {
      type: "step_complete",
      step: 3,
      stepName: PIPELINE_STEPS[2].name,
      stepIcon: PIPELINE_STEPS[2].icon,
      data: step3,
      progress: createProgress(3),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 3,
      stepName: PIPELINE_STEPS[2].name,
      stepIcon: PIPELINE_STEPS[2].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(3),
    };
    throw error;
  }

  // Step 4
  yield {
    type: "step_start",
    step: 4,
    stepName: PIPELINE_STEPS[3].name,
    stepIcon: PIPELINE_STEPS[3].icon,
    progress: createProgress(4),
  };

  let step4: Step4Result;
  try {
    step4 = await analyzeStep4_SpecialStars(input, step1);
    completedSteps.push({
      step: 4,
      name: PIPELINE_STEPS[3].name,
      summary: `길신 ${step4.auspiciousStars.length}개, 흉신 ${step4.inauspiciousStars.length}개`,
    });
    yield {
      type: "step_complete",
      step: 4,
      stepName: PIPELINE_STEPS[3].name,
      stepIcon: PIPELINE_STEPS[3].icon,
      data: step4,
      progress: createProgress(4),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 4,
      stepName: PIPELINE_STEPS[3].name,
      stepIcon: PIPELINE_STEPS[3].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(4),
    };
    throw error;
  }

  // Step 5
  yield {
    type: "step_start",
    step: 5,
    stepName: PIPELINE_STEPS[4].name,
    stepIcon: PIPELINE_STEPS[4].icon,
    progress: createProgress(5),
  };

  let step5: Step5Result;
  try {
    step5 = await analyzeStep5_FortuneTiming(input, step1, step2);
    completedSteps.push({
      step: 5,
      name: PIPELINE_STEPS[4].name,
      summary: `${step5.yearlyFortune.year}년 ${step5.yearlyFortune.score}점`,
    });
    yield {
      type: "step_complete",
      step: 5,
      stepName: PIPELINE_STEPS[4].name,
      stepIcon: PIPELINE_STEPS[4].icon,
      data: step5,
      progress: createProgress(5),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 5,
      stepName: PIPELINE_STEPS[4].name,
      stepIcon: PIPELINE_STEPS[4].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(5),
    };
    throw error;
  }

  // Step 6
  yield {
    type: "step_start",
    step: 6,
    stepName: PIPELINE_STEPS[5].name,
    stepIcon: PIPELINE_STEPS[5].icon,
    progress: createProgress(6),
  };

  let step6: Step6Result;
  try {
    step6 = await analyzeStep6_Synthesis(input, step1, step2, step3, step4, step5);
    completedSteps.push({
      step: 6,
      name: PIPELINE_STEPS[5].name,
      summary: `${step6.overallScore}점 (${step6.gradeText})`,
    });
    yield {
      type: "step_complete",
      step: 6,
      stepName: PIPELINE_STEPS[5].name,
      stepIcon: PIPELINE_STEPS[5].icon,
      data: step6,
      progress: createProgress(6),
    };
  } catch (error) {
    yield {
      type: "step_error",
      step: 6,
      stepName: PIPELINE_STEPS[5].name,
      stepIcon: PIPELINE_STEPS[5].icon,
      error: error instanceof Error ? error.message : "Unknown error",
      progress: createProgress(6),
    };
    throw error;
  }

  // 최종 결과
  yield {
    type: "pipeline_complete",
    step: 6,
    stepName: "분석 완료",
    stepIcon: "🎊",
    data: {
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
    },
    progress: createProgress(6),
  };
}

/**
 * 단일 단계 실행 (개별 API용)
 */
export async function runSingleStep<T>(
  step: number,
  input: SajuAnalysisInput,
  previousResults?: Partial<SajuPipelineResult>
): Promise<StepResult<T>> {
  const startTime = Date.now();

  try {
    let data: unknown;

    switch (step) {
      case 1:
        data = await analyzeStep1_Foundation(input);
        break;
      case 2:
        if (!previousResults?.step1) {
          throw new Error("Step 1 결과가 필요합니다.");
        }
        data = await analyzeStep2_DayMaster(
          input,
          previousResults.step1 as unknown as Step1Result
        );
        break;
      case 3:
        if (!previousResults?.step1 || !previousResults?.step2) {
          throw new Error("Step 1, 2 결과가 필요합니다.");
        }
        data = await analyzeStep3_TenGods(
          input,
          previousResults.step1 as unknown as Step1Result,
          previousResults.step2 as unknown as Step2Result
        );
        break;
      case 4:
        if (!previousResults?.step1) {
          throw new Error("Step 1 결과가 필요합니다.");
        }
        data = await analyzeStep4_SpecialStars(
          input,
          previousResults.step1 as unknown as Step1Result
        );
        break;
      case 5:
        if (!previousResults?.step1 || !previousResults?.step2) {
          throw new Error("Step 1, 2 결과가 필요합니다.");
        }
        data = await analyzeStep5_FortuneTiming(
          input,
          previousResults.step1 as unknown as Step1Result,
          previousResults.step2 as unknown as Step2Result
        );
        break;
      case 6:
        if (
          !previousResults?.step1 ||
          !previousResults?.step2 ||
          !previousResults?.step3 ||
          !previousResults?.step4 ||
          !previousResults?.step5
        ) {
          throw new Error("모든 이전 단계 결과가 필요합니다.");
        }
        data = await analyzeStep6_Synthesis(
          input,
          previousResults.step1 as unknown as Step1Result,
          previousResults.step2 as unknown as Step2Result,
          previousResults.step3 as unknown as Step3Result,
          previousResults.step4 as unknown as Step4Result,
          previousResults.step5 as unknown as Step5Result
        );
        break;
      default:
        throw new Error(`잘못된 단계: ${step}`);
    }

    return {
      success: true,
      data: data as T,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: Date.now() - startTime,
    };
  }
}
