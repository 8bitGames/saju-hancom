"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/i18n/navigation";
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
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-800 text-2xl text-center">
            프리미엄으로 업그레이드
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-center pt-2">
            무료 {featureName} 횟수를 모두 사용했습니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Limits */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-gray-800 font-semibold mb-3">무료 플랜</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-400" />
                <span>결과 저장 1회</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-400" />
                <span>PDF 다운로드 1회</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-400" />
                <span>카카오톡 공유 1회</span>
              </div>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="bg-gradient-to-br from-[#C4A35A]/10 to-[#a88f4a]/10 border border-[#C4A35A]/20 rounded-lg p-4">
            <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
              <span className="bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] text-white text-xs px-2 py-1 rounded">
                PREMIUM
              </span>
              프리미엄 플랜
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C4A35A]" weight="bold" />
                <span className="font-medium">무제한 결과 저장</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C4A35A]" weight="bold" />
                <span className="font-medium">무제한 PDF 다운로드</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#C4A35A]" weight="bold" />
                <span className="font-medium">무제한 공유</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  ₩12,000
                  <span className="text-sm font-normal text-gray-500"> / 연</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
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
              className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              나중에
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-[#C4A35A] to-[#a88f4a] hover:opacity-90 text-white"
            >
              업그레이드
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
