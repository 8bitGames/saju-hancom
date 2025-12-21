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
      <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {mode === "login" ? "로그인" : "회원가입"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {mode === "login"
              ? "사주 결과를 저장하고 PDF를 다운로드하세요"
              : "무료로 결과를 한 번 저장하고 다운로드할 수 있습니다"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              비밀번호
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
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90"
          >
            {loading
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : "회원가입"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {mode === "login"
                ? "계정이 없으신가요? 회원가입"
                : "이미 계정이 있으신가요? 로그인"}
            </button>
          </div>
        </form>

        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 text-center">
            무료: 저장 1회, PDF/공유 각 1회 무료
            <br />
            프리미엄: 연 12,000원 (무제한 저장 및 다운로드)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
