"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SignIn, UserPlus } from "@phosphor-icons/react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email,
            },
          },
        });

        if (error) throw error;

        toast.success("회원가입 완료! 자동으로 로그인되었습니다.");
        onOpenChange(false);
        onSuccess?.();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("로그인 성공!");
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error:', error);

      // Handle rate limiting
      if (error.status === 429 || error.message?.includes('rate limit')) {
        toast.error("요청이 너무 많습니다", {
          description: "잠시 후 다시 시도해주세요. (1분 후)",
        });
      } else if (error.message?.includes('Email rate limit exceeded')) {
        toast.error("이메일 발송 제한", {
          description: "잠시 후 다시 시도해주세요.",
        });
      } else {
        toast.error(error.message || "오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 max-h-[90vh] overflow-y-auto">
        {/* 모드 선택 탭 - 상단에 고정 */}
        <div className="flex gap-2 mb-4" role="tablist" aria-label="로그인 방법 선택">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === "login"
                ? "bg-purple-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
            role="tab"
            aria-selected={mode === "login"}
            aria-controls="auth-form"
          >
            <SignIn className="w-5 h-5" weight={mode === "login" ? "fill" : "regular"} />
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              mode === "register"
                ? "bg-emerald-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
            role="tab"
            aria-selected={mode === "register"}
            aria-controls="auth-form"
          >
            <UserPlus className="w-5 h-5" weight={mode === "register" ? "fill" : "regular"} />
            회원가입
          </button>
        </div>

        <DialogHeader>
          <DialogTitle className={`text-xl flex items-center gap-2 ${
            mode === "login" ? "text-purple-400" : "text-emerald-400"
          }`}>
            {mode === "login" ? (
              <>
                <SignIn className="w-6 h-6" weight="fill" />
                기존 회원 로그인
              </>
            ) : (
              <>
                <UserPlus className="w-6 h-6" weight="fill" />
                새 계정 만들기
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {mode === "login"
              ? "이메일과 비밀번호로 로그인하세요"
              : "간단한 가입으로 사주 결과를 저장하세요"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form" role="tabpanel">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              비밀번호 {mode === "register" && <span className="text-white/40">(6자 이상)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full ${
              mode === "login"
                ? "bg-gradient-to-r from-purple-500 to-violet-600"
                : "bg-gradient-to-r from-emerald-500 to-teal-600"
            } hover:opacity-90`}
          >
            {loading ? (
              "처리 중..."
            ) : mode === "login" ? (
              <span className="flex items-center gap-2">
                <SignIn className="w-5 h-5" weight="bold" />
                로그인
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" weight="bold" />
                무료 회원가입
              </span>
            )}
          </Button>
        </form>

        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 text-center">
            {mode === "register" ? (
              <>
                가입 즉시 <span className="text-emerald-400">무료 혜택</span>: 저장 1회, PDF/공유 각 1회
              </>
            ) : (
              <>
                무료: 저장 1회, PDF/공유 각 1회 무료
                <br />
                프리미엄: 연 12,000원 (무제한 저장 및 다운로드)
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
