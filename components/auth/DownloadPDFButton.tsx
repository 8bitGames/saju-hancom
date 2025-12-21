"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { UpgradeDialog } from "./UpgradeDialog";
import { toast } from "sonner";
import { FilePdf } from "@phosphor-icons/react";
import { downloadPDF } from "@/lib/pdf/generator";

interface DownloadPDFButtonProps {
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
  result: any;
  className?: string;
}

export function DownloadPDFButton({
  birthData,
  result,
  className,
}: DownloadPDFButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    console.log('[DownloadPDFButton] handleDownload called');

    // Check if user is authenticated
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    console.log('[DownloadPDFButton] Current user:', currentUser?.email || 'Not logged in');

    if (!currentUser) {
      console.log('[DownloadPDFButton] No user, showing auth dialog');
      setShowAuthDialog(true);
      return;
    }

    setLoading(true);

    try {
      console.log('[DownloadPDFButton] Checking usage limit...');
      // Check usage limit
      const response = await fetch("/api/saju/check-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: "pdf_download" }),
      });

      const data = await response.json();
      console.log('[DownloadPDFButton] Usage check result:', data);

      if (!data.allowed) {
        console.log('[DownloadPDFButton] Usage limit exceeded');
        setShowUpgradeDialog(true);
        return;
      }

      // Generate and download PDF
      try {
        console.log('[DownloadPDFButton] Starting PDF generation...');
        const filename = `hansa-ai-saju-${birthData.year}${birthData.month}${birthData.day}.pdf`;
        console.log('[DownloadPDFButton] Calling downloadPDF with:', { birthData, result, filename });

        await downloadPDF({ birthData, result }, filename);

        console.log('[DownloadPDFButton] PDF download completed, tracking usage...');

        // Track usage
        await fetch("/api/saju/track-usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "pdf_download" }),
        });

        console.log('[DownloadPDFButton] ✅ PDF download and tracking successful');
        toast.success("PDF 다운로드 준비 완료", {
          description: "인쇄 창에서 'PDF로 저장'을 선택하세요.",
        });
      } catch (pdfError: any) {
        console.error("[DownloadPDFButton] ❌ PDF generation error:", pdfError);
        toast.error("PDF 생성 실패", {
          description: pdfError.message || "다시 시도해주세요",
        });
      }
    } catch (error: any) {
      console.error("[DownloadPDFButton] ❌ Download error:", error);
      toast.error("오류가 발생했습니다", {
        description: error.message || "다시 시도해주세요",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleDownload}
        disabled={loading}
        className={className}
        variant="outline"
      >
        <FilePdf className="w-4 h-4 sm:mr-2 shrink-0" />
        <span className="hidden sm:inline">{loading ? "생성 중..." : "PDF 다운로드"}</span>
        <span className="sm:hidden">{loading ? "PDF..." : "PDF"}</span>
      </Button>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleDownload}
      />

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        featureName="PDF 다운로드"
      />
    </>
  );
}
