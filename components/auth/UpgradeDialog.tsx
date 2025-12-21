"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  featureName = "이 기능",
}: UpgradeDialogProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push("/premium");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl text-center">
            프리미엄으로 업그레이드
          </DialogTitle>
          <DialogDescription className="text-white/60 text-center pt-2">
            무료 {featureName} 횟수를 모두 사용했습니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Limits */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">무료 플랜</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white/40" />
                <span>결과 저장 1회</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white/40" />
                <span>PDF 다운로드 1회</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white/40" />
                <span>카카오톡 공유 1회</span>
              </div>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-500 to-violet-600 text-white text-xs px-2 py-1 rounded">
                PREMIUM
              </span>
              프리미엄 플랜
            </h3>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" weight="bold" />
                <span className="font-medium">무제한 결과 저장</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" weight="bold" />
                <span className="font-medium">무제한 PDF 다운로드</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" weight="bold" />
                <span className="font-medium">무제한 공유</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  ₩12,000
                  <span className="text-sm font-normal text-white/60"> / 연</span>
                </div>
                <div className="text-xs text-white/40 mt-1">
                  또는 $12 / 연
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              나중에
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90"
            >
              업그레이드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
