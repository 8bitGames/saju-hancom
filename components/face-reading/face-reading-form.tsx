"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, User, Upload, X } from "@/components/ui/icons";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";

interface FormData {
  gender: "male" | "female";
  imagePreview: string | null;
}

export function FaceReadingForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formData, setFormData] = useState<FormData>({
    gender: "male",
    imagePreview: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // 카메라 열기
  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraOpen(true);

      // 비디오 요소에 스트림 연결
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      // 카메라 접근 실패시 파일 선택으로 대체
      alert("카메라에 접근할 수 없습니다. 갤러리에서 사진을 선택해주세요.");
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  }, []);

  // 카메라 닫기
  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

  // 사진 촬영
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setFormData((prev) => ({
          ...prev,
          imagePreview: imageData,
        }));

        closeCamera();
      }
    }
  }, [closeCamera]);

  // 모바일 카메라로 직접 촬영 (capture="user" 사용)
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 크기는 10MB 이하여야 합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 크기는 10MB 이하여야 합니다.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imagePreview) {
      alert("사진을 촬영해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // API로 이미지 전송하여 분석
      const response = await fetch("/api/face-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: formData.imagePreview,
          gender: formData.gender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "분석에 실패했습니다.");
      }

      const result = await response.json();

      // 결과를 sessionStorage에 저장 후 결과 페이지로 이동
      sessionStorage.setItem("faceReadingResult", JSON.stringify(result));
      router.push("/face-reading/result");
    } catch (error) {
      console.error("Face reading error:", error);
      alert(error instanceof Error ? error.message : "관상 분석 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* 성별 선택 */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-sm sm:text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" weight="fill" />
          성별
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(["male", "female"] as const).map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, gender }))}
              className={`py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-medium transition-all ${
                formData.gender === gender
                  ? "bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white shadow-lg"
                  : "bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:bg-[var(--background-elevated)]/80"
              }`}
            >
              {gender === "male" ? "남성" : "여성"}
            </button>
          ))}
        </div>
      </div>

      {/* 사진 촬영/업로드 */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-sm sm:text-base font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
          얼굴 사진
        </label>

        {/* 숨겨진 파일 입력들 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleCameraCapture}
          className="hidden"
        />

        {/* 숨겨진 캔버스 (캡처용) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 카메라 뷰 */}
        {isCameraOpen && (
          <div className="relative">
            <div className="aspect-square max-w-[240px] sm:max-w-[300px] mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <div className="flex gap-3 justify-center mt-3 sm:mt-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-[var(--accent)] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--accent)]" />
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--background-elevated)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--background-elevated)]/80 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}

        {/* 이미지 미리보기 */}
        {!isCameraOpen && formData.imagePreview && (
          <div className="relative">
            <div className="aspect-square max-w-[240px] sm:max-w-[300px] mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--background-elevated)]">
              <img
                src={formData.imagePreview}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* 촬영/업로드 버튼 */}
        {!isCameraOpen && !formData.imagePreview && (
          <div className="space-y-2 sm:space-y-3">
            {/* 카메라로 촬영 버튼 */}
            <button
              type="button"
              onClick={openCamera}
              className="w-full py-4 sm:py-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white flex flex-col items-center justify-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold">카메라로 촬영하기</p>
                <p className="text-xs sm:text-sm text-white/80 mt-0.5 sm:mt-1">
                  정면 얼굴 사진이 가장 정확합니다
                </p>
              </div>
            </button>

            {/* 또는 구분선 */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs sm:text-sm text-[var(--text-tertiary)]">또는</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {/* 갤러리에서 선택 버튼 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--background-elevated)] flex items-center justify-center gap-2 sm:gap-3 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all"
            >
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-secondary)]" />
              <span className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
                갤러리에서 선택
              </span>
            </button>
          </div>
        )}

        <p className="text-[10px] sm:text-xs text-center text-[var(--text-tertiary)]">
          * 촬영된 사진은 분석 후 즉시 삭제됩니다
        </p>
      </div>

      {/* 분석 가이드 */}
      <div className="bg-[var(--background-elevated)] rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
          좋은 분석을 위한 팁
        </p>
        <ul className="text-xs sm:text-sm text-[var(--text-secondary)] space-y-0.5 sm:space-y-1">
          <li>• 정면을 바라본 사진을 사용하세요</li>
          <li>• 얼굴이 잘 보이는 밝은 사진이 좋습니다</li>
          <li>• 모자나 선글라스를 벗은 사진을 사용하세요</li>
        </ul>
      </div>

      {/* 제출 버튼 */}
      <HoverBorderGradient
        containerClassName="w-full rounded-lg sm:rounded-xl"
        className="w-full h-12 sm:h-16 flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-[var(--element-metal)] to-[var(--element-water)] text-white font-bold text-base sm:text-lg rounded-lg sm:rounded-xl disabled:opacity-50"
        as="button"
      >
        {isLoading ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            분석 중...
          </div>
        ) : (
          <>
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            관상 분석하기
          </>
        )}
      </HoverBorderGradient>
    </form>
  );
}
