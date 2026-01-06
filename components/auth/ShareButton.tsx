"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { UpgradeDialog } from "./UpgradeDialog";
import { toast } from "sonner";
import { Share } from "@phosphor-icons/react";

interface ShareButtonProps {
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
  title?: string;
  description?: string;
  className?: string;
}

export function ShareButton({
  resultId: initialResultId,
  birthData,
  resultData,
  title = "사주 분석 결과",
  description,
  className,
}: ShareButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [currentResultId, setCurrentResultId] = useState<string | undefined>(initialResultId);

  const supabase = createClient();

  // Update currentResultId when prop changes
  useEffect(() => {
    if (initialResultId) {
      setCurrentResultId(initialResultId);
    }
  }, [initialResultId]);

  // Check Web Share API support
  useEffect(() => {
    setMounted(true);
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
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
      const usageResponse = await fetch("/api/saju/check-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "kakao_share" }),
      });

      const usageData = await usageResponse.json();

      if (!usageData.allowed) {
        setShowUpgradeDialog(true);
        setLoading(false);
        return;
      }

      let shareResultId = currentResultId;

      // If no resultId, try to save first
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

      // Generate share URL with short ID
      const shareUrl = `${window.location.origin}/saju/s/${shareResultId}`;
      const shareDescription =
        description ||
        `${birthData.year}년 ${birthData.month}월 ${birthData.day}일생 사주팔자 분석`;

      let shareSuccess = false;

      if (canShare) {
        // Use Web Share API
        await navigator.share({
          title,
          text: shareDescription,
          url: shareUrl,
        });
        shareSuccess = true;
        toast.success("공유가 완료되었습니다");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        shareSuccess = true;
        toast.success("링크가 클립보드에 복사되었습니다");
      }

      // Track usage on success
      if (shareSuccess) {
        await fetch("/api/saju/track-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "kakao_share" }),
        });
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== "AbortError") {
        // Fallback to clipboard if share fails
        try {
          if (currentResultId) {
            const shareUrl = `${window.location.origin}/saju/s/${currentResultId}`;
            await navigator.clipboard.writeText(shareUrl);
            toast.success("링크가 클립보드에 복사되었습니다");

            // Track usage on fallback success
            await fetch("/api/saju/track-usage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ actionType: "kakao_share" }),
            });
          } else {
            toast.error("공유 중 오류가 발생했습니다");
          }
        } catch {
          toast.error("공유 중 오류가 발생했습니다");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleShare}
        disabled={loading}
        className={className}
        variant="outline"
      >
        <Share className="w-4 h-4 sm:mr-2 shrink-0" weight="bold" />
        <span className="hidden sm:inline">
          {loading ? "공유 중..." : "공유하기"}
        </span>
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
        featureName="공유"
      />
    </>
  );
}
