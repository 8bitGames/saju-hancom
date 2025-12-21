"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, User, Upload, X, ArrowRight } from "@phosphor-icons/react";

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

  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("카메라에 접근할 수 없습니다. 갤러리에서 사진을 선택해주세요.");
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  }, [stream]);

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
      router.push("/face-reading/result");
    } catch (error) {
      console.error("Face reading error:", error);
      alert(error instanceof Error ? error.message : "관상 분석 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <User className="w-4 h-4 text-white/60" weight="fill" />
          성별
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, gender }))}
              className={`h-12 rounded-xl font-medium text-base transition-all ${
                formData.gender === gender
                  ? "bg-[#ef4444] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {gender === "male" ? "남성" : "여성"}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-white/60" />
          얼굴 사진
        </label>

        {/* Hidden file inputs */}
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

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera View */}
        {isCameraOpen && (
          <div className="relative">
            <div className="aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-[#ef4444] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-[#ef4444]" />
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="w-12 h-12 rounded-full bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {!isCameraOpen && formData.imagePreview && (
          <div className="relative">
            <div className="aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-white/5">
              <img
                src={formData.imagePreview}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Upload/Camera Buttons */}
        {!isCameraOpen && !formData.imagePreview && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={openCamera}
              className="w-full py-6 rounded-2xl bg-[#ef4444] text-white flex flex-col items-center justify-center gap-3 hover:bg-[#dc2626] transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">카메라로 촬영하기</p>
                <p className="text-sm text-white/80 mt-1">
                  정면 얼굴 사진이 가장 정확합니다
                </p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-sm text-white/40">또는</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center gap-3 hover:border-[#ef4444] hover:bg-[#ef4444]/5 transition-all"
            >
              <Upload className="w-6 h-6 text-white/60" />
              <span className="text-base text-white/60 font-medium">
                갤러리에서 선택
              </span>
            </button>
          </div>
        )}

        <p className="text-xs text-center text-white/40">
          * 촬영된 사진은 분석 후 즉시 삭제됩니다
        </p>
      </div>

      {/* Tips */}
      <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/10">
        <p className="text-sm font-medium text-white">
          좋은 분석을 위한 팁
        </p>
        <ul className="text-sm text-white/60 space-y-1">
          <li>- 정면을 바라본 사진을 사용하세요</li>
          <li>- 얼굴이 잘 보이는 밝은 사진이 좋습니다</li>
          <li>- 모자나 선글라스를 벗은 사진을 사용하세요</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.imagePreview}
        className="w-full h-14 flex items-center justify-center gap-2 bg-[#ef4444] text-white font-bold text-lg rounded-xl hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            분석 중...
          </div>
        ) : (
          <>
            관상 분석하기
            <ArrowRight className="w-5 h-5" weight="bold" />
          </>
        )}
      </button>
    </form>
  );
}
