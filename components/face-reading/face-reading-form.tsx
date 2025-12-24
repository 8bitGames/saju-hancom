"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Camera, User, X, ArrowRight, ArrowLeft, Lightbulb, CheckCircle, GenderMale, GenderFemale } from "@phosphor-icons/react";

type Step = "gender" | "camera" | "preview";

interface FormData {
  gender: "male" | "female" | null;
  imagePreview: string | null;
}

const PHOTO_TIPS = [
  "정면을 바라봐 주세요",
  "얼굴 전체가 보이게 해주세요",
  "밝은 곳에서 촬영하세요",
  "안경이나 모자를 벗어주세요",
];

export function FaceReadingForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("gender");
  const [formData, setFormData] = useState<FormData>({
    gender: null,
    imagePreview: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // For portal - need to wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate tips every 3 seconds
  useEffect(() => {
    if (step !== "camera") return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % PHOTO_TIPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [step]);

  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setCameraReady(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      }, 100);
    } catch {
      alert("카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.");
      setStep("gender");
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        // Keep full frame, no cropping
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror the image horizontally for selfie camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setFormData((prev) => ({
          ...prev,
          imagePreview: imageData,
        }));

        closeCamera();
        setStep("preview");
      }
    }
  }, [closeCamera]);

  const handleGenderSelect = (gender: "male" | "female") => {
    setFormData((prev) => ({ ...prev, gender }));
    setStep("camera");
    openCamera();
  };

  const handleRetake = () => {
    setFormData((prev) => ({ ...prev, imagePreview: null }));
    setStep("camera");
    openCamera();
  };

  const handleBack = () => {
    if (step === "camera") {
      closeCamera();
      setStep("gender");
    } else if (step === "preview") {
      setStep("gender");
      setFormData((prev) => ({ ...prev, imagePreview: null }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.imagePreview || !formData.gender) {
      return;
    }

    setIsLoading(true);

    try {
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

      sessionStorage.setItem("faceReadingResult", JSON.stringify(result));
      sessionStorage.setItem("faceReadingImage", formData.imagePreview);
      sessionStorage.setItem("faceReadingGender", formData.gender);
      router.push("/face-reading/result");
    } catch (error) {
      console.error("Face reading error:", error);
      alert(error instanceof Error ? error.message : "관상 분석 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Gender Selection Step
  if (step === "gender") {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#ef4444]/20 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-[#ef4444]" weight="fill" />
          </div>
          <h2 className="text-xl font-bold text-white">성별을 선택해주세요</h2>
          <p className="text-sm text-white/60">
            정확한 관상 분석을 위해 필요합니다
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleGenderSelect("male")}
            className="py-8 rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 hover:border-blue-400 hover:from-blue-500/30 hover:to-blue-600/20 transition-all group"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GenderMale className="w-8 h-8 text-blue-400" weight="bold" />
              </div>
              <span className="text-lg font-bold text-white">남성</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleGenderSelect("female")}
            className="py-8 rounded-2xl bg-gradient-to-b from-pink-500/20 to-pink-600/10 border-2 border-pink-500/30 hover:border-pink-400 hover:from-pink-500/30 hover:to-pink-600/20 transition-all group"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GenderFemale className="w-8 h-8 text-pink-400" weight="bold" />
              </div>
              <span className="text-lg font-bold text-white">여성</span>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-white/40">
          촬영된 사진은 분석 후 즉시 삭제됩니다
        </p>
      </div>
    );
  }

  // Full-screen Camera Step
  if (step === "camera") {
    const cameraUI = (
      <div className="fixed inset-0 z-[9999] bg-black" style={{ isolation: "isolate" }}>
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Video - Full Screen Background */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />

        {/* UI Layer */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-5 h-5" weight="bold" />
            </button>
            <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                {formData.gender === "male" ? "남성" : "여성"} 관상 분석
              </span>
            </div>
            <div className="w-10" />
          </div>

          {/* Center - Face Guide Frame */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-64 h-80">
              {/* Simple oval border */}
              <div className="absolute inset-0 rounded-[50%] border-[3px] border-white/70" />

              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-[#ef4444]" />
              <div className="absolute -top-2 -right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-[#ef4444]" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-[3px] border-l-[3px] border-[#ef4444]" />
              <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-[#ef4444]" />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="px-4 pb-8 pt-4 space-y-4">
            {/* Tips */}
            <div className="mx-auto max-w-sm px-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ef4444]/30 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-[#ef4444]" weight="fill" />
                </div>
                <p className="text-sm text-white font-medium">
                  {PHOTO_TIPS[currentTipIndex]}
                </p>
              </div>
              <div className="flex gap-1.5 justify-center mt-3">
                {PHOTO_TIPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === currentTipIndex
                        ? "w-4 bg-[#ef4444]"
                        : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Capture Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                <div className="w-14 h-14 rounded-full bg-[#ef4444] flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" weight="fill" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {!cameraReady && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white/60">카메라 준비 중...</p>
            </div>
          </div>
        )}
      </div>
    );

    return mounted ? createPortal(cameraUI, document.body) : null;
  }

  // Preview Step
  if (step === "preview") {
    const previewUI = (
      <div className="fixed inset-0 z-[9999] bg-black" style={{ isolation: "isolate" }}>
        {/* Full Screen Image Preview */}
        {formData.imagePreview && (
          <img
            src={formData.imagePreview}
            alt="촬영된 사진"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* UI Overlay */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
            {/* Success indicator */}
            <div className="px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-white" weight="fill" />
              <span className="text-xs font-medium text-white">촬영 완료</span>
            </div>
            <div className="w-10" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Actions */}
          <div className="p-4 pb-8 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-center text-white text-sm">
              이 사진으로 관상을 분석할까요?
            </p>

            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isLoading}
                className="flex-1 h-14 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                다시 촬영
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 h-14 rounded-xl bg-[#ef4444] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    분석하기
                    <ArrowRight className="w-5 h-5" weight="bold" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return mounted ? createPortal(previewUI, document.body) : null;
  }

  return null;
}
