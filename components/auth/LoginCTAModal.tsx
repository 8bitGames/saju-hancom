"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { Sparkle, FloppyDisk, ClockCounterClockwise } from "@phosphor-icons/react";

interface LoginCTAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  resultType?: "saju" | "compatibility" | "couple" | "face";
}

export function LoginCTAModal({
  open,
  onOpenChange,
  onSuccess,
  resultType = "saju",
}: LoginCTAModalProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const getResultTypeText = () => {
    switch (resultType) {
      case "saju":
        return "사주";
      case "compatibility":
        return "궁합";
      case "couple":
        return "연인 궁합";
      case "face":
        return "관상";
      default:
        return "분석";
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open && !showAuthDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center mb-4">
              <Sparkle className="w-8 h-8 text-purple-400" weight="fill" />
            </div>
            <DialogTitle className="text-white text-xl text-center">
              결과를 저장하시겠어요?
            </DialogTitle>
            <DialogDescription className="text-white/60 text-center">
              로그인하면 {getResultTypeText()} 결과를 저장하고
              <br />
              언제든 다시 확인할 수 있어요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <FloppyDisk className="w-5 h-5 text-green-400" weight="fill" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">결과 자동 저장</p>
                <p className="text-white/50 text-xs">분석 결과가 자동으로 저장됩니다</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <ClockCounterClockwise className="w-5 h-5 text-blue-400" weight="fill" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">분석 히스토리</p>
                <p className="text-white/50 text-xs">이전 분석 결과를 언제든 다시 확인</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowAuthDialog(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90"
            >
              로그인 / 회원가입
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-white/60 hover:text-white hover:bg-white/5"
            >
              나중에 할게요
            </Button>
          </div>

          <p className="text-xs text-white/40 text-center pt-2">
            무료 계정으로 시작하세요
          </p>
        </DialogContent>
      </Dialog>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
