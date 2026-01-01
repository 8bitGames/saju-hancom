"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { UpgradeDialog } from "./UpgradeDialog";
import { toast } from "sonner";

interface ShareKakaoButtonProps {
  resultId?: string;
  birthData: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: string;
    isLunar: boolean;
    city: string;
  };
  resultData?: any;
  className?: string;
}

export function ShareKakaoButton({
  resultId: initialResultId,
  birthData,
  resultData,
  className,
}: ShareKakaoButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentResultId, setCurrentResultId] = useState<string | undefined>(initialResultId);

  const supabase = createClient();

  // Update currentResultId when prop changes
  useEffect(() => {
    if (initialResultId) {
      setCurrentResultId(initialResultId);
    }
  }, [initialResultId]);

  // Prevent hydration mismatch and load Kakao SDK
  useEffect(() => {
    setMounted(true);

    // Load Kakao SDK
    if (!document.querySelector('script[src*="kakao.js"]')) {
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          if (process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
          }
        }
      };
    } else if (window.Kakao && !window.Kakao.isInitialized()) {
      if (process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      }
    }
  }, []);

  const handleShare = async () => {
    // Check if user is authenticated
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setShowAuthDialog(true);
      return;
    }

    setLoading(true);

    try {
      // Check usage limit
      const response = await fetch("/api/saju/check-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "kakao_share" }),
      });

      const data = await response.json();

      if (!data.allowed) {
        setShowUpgradeDialog(true);
        return;
      }

      if (!window.Kakao) {
        toast.error("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      let shareResultId = currentResultId;

      // If no resultId, save first to get one
      if (!shareResultId && resultData) {
        const saveResponse = await fetch("/api/saju/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthData, resultData }),
        });
        const saveData = await saveResponse.json();

        if (saveData.success && saveData.resultId) {
          shareResultId = saveData.resultId;
          setCurrentResultId(shareResultId);
        }
      }

      if (!shareResultId) {
        toast.error("결과가 아직 저장되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      // Create share URL with result ID
      const shareUrl = `${window.location.origin}/saju/s/${shareResultId}`;

      window.Kakao.Link.sendDefault({
        objectType: "feed",
        content: {
          title: "사주 분석 결과",
          description: `${birthData.year}년 ${birthData.month}월 ${birthData.day}일생 사주팔자 분석`,
          imageUrl: `${window.location.origin}/og-image.png`,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: "결과 보기",
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });

      // Track usage
      await fetch("/api/saju/track-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "kakao_share" }),
      });

      toast.success("카카오톡으로 공유되었습니다");
    } catch (error) {
      toast.error("공유 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleShare}
        disabled={loading}
        className={className}
        style={{ backgroundColor: "#FEE500", color: "#000000" }}
      >
        <svg
          className="w-4 h-4 sm:mr-2 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.484 1.641 4.67 4.141 6.078-.203.844-.656 2.672-.75 3.094-.109.484.188.469.406.344.172-.094 2.766-1.828 3.219-2.109C9.656 17.969 10.828 18 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" />
        </svg>
        <span className="hidden sm:inline">{loading ? "공유 중..." : "카카오톡 공유"}</span>
        <span className="sm:hidden">{loading ? "공유..." : "공유"}</span>
      </Button>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleShare}
      />

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        featureName="카카오톡 공유"
      />
    </>
  );
}

// Extend Window interface for Kakao SDK
declare global {
  interface Window {
    Kakao: any;
  }
}
