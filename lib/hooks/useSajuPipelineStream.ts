/**
 * 사주 분석 파이프라인 스트리밍 훅
 * SSE를 통해 단계별 분석 결과를 실시간으로 수신
 * localStorage에 결과 저장
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { clearDetailAnalysisStorage } from "@/components/saju/DetailAnalysisModal";
import type {
  SajuPipelineResult,
  PipelineProgress,
  Step1_Foundation,
  Step2_DayMaster,
  Step3_TenGods,
  Step4_SpecialStars,
  Step5_FortuneTiming,
  Step6_Synthesis,
} from "@/lib/saju/pipeline-types";

// ============================================================================
// 타입 정의
// ============================================================================

export interface StepInfo {
  step: number;
  name: string;
  icon: string;
  description: string;
}

export interface PipelineState {
  status: "idle" | "running" | "completed" | "error";
  currentStep: number;
  totalSteps: number;
  steps: StepInfo[];
  completedSteps: Array<{
    step: number;
    name: string;
    summary: string;
  }>;
  stepResults: Partial<SajuPipelineResult>;
  finalResult: SajuPipelineResult | null;
  error: string | null;
}

export interface UseSajuPipelineStreamReturn {
  state: PipelineState;
  startAnalysis: (input: {
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    isLunar?: boolean;
    name?: string;
  }) => Promise<void>;
  reset: () => void;
  clearSavedData: () => void;
  loadSavedData: () => boolean;
  hasSavedData: () => boolean;
  isLoading: boolean;
  progress: number; // 0-100
}

// ============================================================================
// localStorage 키
// ============================================================================

const STORAGE_KEY = "saju_analysis_result";
const STORAGE_INPUT_KEY = "saju_analysis_input";

interface SavedAnalysisData {
  result: SajuPipelineResult;
  input: {
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    isLunar?: boolean;
  };
  savedAt: string;
}

// ============================================================================
// 초기 상태
// ============================================================================

const initialState: PipelineState = {
  status: "idle",
  currentStep: 0,
  totalSteps: 6,
  steps: [],
  completedSteps: [],
  stepResults: {},
  finalResult: null,
  error: null,
};

// ============================================================================
// 훅 구현
// ============================================================================

export function useSajuPipelineStream(): UseSajuPipelineStreamReturn {
  const [state, setState] = useState<PipelineState>(initialState);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // localStorage에서 저장된 데이터 확인
  const hasSavedData = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null;
    } catch {
      return false;
    }
  }, []);

  // localStorage에서 저장된 데이터 로드
  const loadSavedData = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      const data: SavedAnalysisData = JSON.parse(saved);
      if (data.result) {
        setState({
          ...initialState,
          status: "completed",
          finalResult: data.result,
          completedSteps: [
            { step: 1, name: "사주 원국 분석", summary: "완료" },
            { step: 2, name: "일간 분석", summary: "완료" },
            { step: 3, name: "십신 분석", summary: "완료" },
            { step: 4, name: "신살 분석", summary: "완료" },
            { step: 5, name: "운세 분석", summary: "완료" },
            { step: 6, name: "종합 해석", summary: "완료" },
          ],
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // localStorage 데이터 삭제 (상세 분석 포함)
  const clearSavedData = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_INPUT_KEY);
      // 상세 분석 데이터도 함께 삭제
      clearDetailAnalysisStorage();
      setState(initialState);
    } catch {
      // 무시
    }
  }, []);

  const startAnalysis = useCallback(async (input: {
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    isLunar?: boolean;
    name?: string;
  }) => {
    // 상태 초기화 및 시작
    setState({
      ...initialState,
      status: "running",
    });

    try {
      const response = await fetch("/api/saju/analyze/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "분석 요청 실패");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("스트림을 읽을 수 없습니다.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              handleEvent(data);
            } catch {
              // JSON 파싱 에러 무시
            }
          }
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }));
    }
  }, []);

  const handleEvent = useCallback((event: {
    type: string;
    step?: number;
    stepName?: string;
    stepIcon?: string;
    data?: unknown;
    error?: string;
    progress?: PipelineProgress;
    totalSteps?: number;
    steps?: StepInfo[];
  }) => {
    switch (event.type) {
      case "pipeline_start":
        setState((prev) => ({
          ...prev,
          totalSteps: event.totalSteps || 6,
          steps: event.steps || [],
        }));
        break;

      case "step_start":
        setState((prev) => ({
          ...prev,
          currentStep: event.step || prev.currentStep,
        }));
        break;

      case "step_complete":
        setState((prev) => {
          const newStepResults = { ...prev.stepResults };

          // 단계별 결과 저장
          if (event.step && event.data) {
            switch (event.step) {
              case 1:
                newStepResults.step1 = event.data as Step1_Foundation;
                break;
              case 2:
                newStepResults.step2 = event.data as Step2_DayMaster;
                break;
              case 3:
                newStepResults.step3 = event.data as Step3_TenGods;
                break;
              case 4:
                newStepResults.step4 = event.data as Step4_SpecialStars;
                break;
              case 5:
                newStepResults.step5 = event.data as Step5_FortuneTiming;
                break;
              case 6:
                newStepResults.step6 = event.data as Step6_Synthesis;
                break;
            }
          }

          return {
            ...prev,
            stepResults: newStepResults,
            completedSteps: event.progress?.completedSteps || prev.completedSteps,
          };
        });
        break;

      case "step_error":
        setState((prev) => ({
          ...prev,
          status: "error",
          error: event.error || "단계 실행 중 오류",
        }));
        break;

      case "pipeline_complete":
        const result = event.data as SajuPipelineResult;
        setState((prev) => ({
          ...prev,
          status: "completed",
          finalResult: result,
        }));
        // localStorage에 저장
        if (typeof window !== "undefined") {
          try {
            const saveData: SavedAnalysisData = {
              result,
              input: {
                birthDate: result.step1?.pillars?.year?.stem || "",
                birthTime: "",
                gender: "male",
              },
              savedAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
          } catch {
            // 저장 실패 무시
          }
        }
        break;

      case "stream_end":
        // 스트림 종료
        break;

      case "error":
        setState((prev) => ({
          ...prev,
          status: "error",
          error: event.error || "알 수 없는 오류",
        }));
        break;
    }
  }, []);

  const isLoading = state.status === "running";
  const progress = state.totalSteps > 0
    ? Math.round((state.completedSteps.length / state.totalSteps) * 100)
    : 0;

  return {
    state,
    startAnalysis,
    reset,
    clearSavedData,
    loadSavedData,
    hasSavedData,
    isLoading,
    progress,
  };
}
