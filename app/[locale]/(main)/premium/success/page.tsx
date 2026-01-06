import { Metadata } from "next";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "프리미엄 구독 완료 | 사주 한사",
  description: "프리미엄 구독이 완료되었습니다",
};

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-400" weight="fill" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          프리미엄 구독 완료!
        </h1>

        <p className="text-xl text-white/60 mb-12">
          이제 무제한으로 사주 분석을 이용하실 수 있습니다
        </p>

        {/* Features Unlocked */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">
            잠금 해제된 기능
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" weight="bold" />
              <div>
                <p className="text-white font-medium">무제한 저장</p>
                <p className="text-sm text-white/60">사주 결과를 원하는 만큼 저장하세요</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" weight="bold" />
              <div>
                <p className="text-white font-medium">무제한 PDF</p>
                <p className="text-sm text-white/60">PDF를 언제든 다운로드하세요</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" weight="bold" />
              <div>
                <p className="text-white font-medium">무제한 공유</p>
                <p className="text-sm text-white/60">카카오톡으로 자유롭게 공유하세요</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" weight="bold" />
              <div>
                <p className="text-white font-medium">광고 없음</p>
                <p className="text-sm text-white/60">깨끗한 환경에서 이용하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/saju">
          <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold px-8 py-6 text-lg">
            사주 분석 시작하기
            <ArrowRight className="w-5 h-5 ml-2" weight="bold" />
          </Button>
        </Link>

        {/* Receipt Info */}
        <p className="text-sm text-white/40 mt-8">
          구독 영수증이 이메일로 전송되었습니다
        </p>
      </div>
    </div>
  );
}
