"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { UpgradeDialog } from "./UpgradeDialog";
import { toast } from "sonner";
import { FloppyDisk } from "@phosphor-icons/react";

interface SaveResultButtonProps {
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
  resultData: any;
  className?: string;
}

export function SaveResultButton({
  birthData,
  resultData,
  className,
}: SaveResultButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
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
      const response = await fetch("/api/saju/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthData,
          resultData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error?.includes("limit")) {
          setShowUpgradeDialog(true);
        } else {
          toast.error(data.error || "저장 실패");
        }
        return;
      }

      toast.success("결과가 저장되었습니다!");
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSave}
        disabled={loading}
        className={className}
        variant="outline"
      >
        <FloppyDisk className="w-4 h-4 sm:mr-2 shrink-0" />
        <span className="hidden sm:inline">{loading ? "저장 중..." : "결과 저장"}</span>
        <span className="sm:hidden">{loading ? "저장..." : "저장"}</span>
      </Button>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleSave}
      />

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        featureName="결과 저장"
      />
    </>
  );
}
