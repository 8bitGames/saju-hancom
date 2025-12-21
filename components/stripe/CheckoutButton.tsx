"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkle } from "@phosphor-icons/react";

interface CheckoutButtonProps {
  currency?: 'KRW' | 'USD';
  className?: string;
}

export function CheckoutButton({ currency = 'KRW', className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      });

      const data = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          toast.error('로그인이 필요합니다', {
            description: '프리미엄을 구독하려면 먼저 로그인해주세요.',
          });
          return;
        }
        toast.error(data.error || '결제 세션 생성 실패');
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      <Sparkle className="w-4 h-4 mr-2" weight="fill" />
      {loading ? '처리 중...' : '프리미엄 시작하기'}
    </Button>
  );
}
