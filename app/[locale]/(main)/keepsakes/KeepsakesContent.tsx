"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import {
  Scroll,
  BookOpen,
  Star,
  Calendar,
  Sparkle,
  Download,
  Share,
  Trash,
  ArrowRight,
  FileText,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { getLocalHistory, type LocalHistoryItem, type LocalSajuHistory } from "@/lib/local-history";
import { GUARDIANS, type ElementType } from "@/lib/constants/guardians";
import type { Locale } from "@/lib/i18n/config";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko, enUS } from "date-fns/locale";

const LABELS = {
  ko: {
    title: "운명 기록서",
    subtitle: "나의 사주와 운세를 영원히 간직하세요",
    emptyTitle: "아직 기록이 없습니다",
    emptyDesc: "사주 분석을 시작하여 나만의 운명 기록서를 만들어보세요",
    startAnalysis: "사주 분석 시작",
    recentRecords: "최근 기록",
    guardian: "수호신",
    viewDetail: "자세히 보기",
    export: "PDF 내보내기",
    share: "공유하기",
    deleteRecord: "삭제",
    confirmDelete: "정말 삭제하시겠습니까?",
    sajuResult: "사주 분석 결과",
    todayFortune: "오늘의 운세",
    compatibility: "궁합",
    faceReading: "관상",
    unknown: "알 수 없음",
    created: "생성일",
    records: "기록",
    totalRecords: "총 기록 수",
    cheongrium: "청기운",
  },
  en: {
    title: "Destiny Record",
    subtitle: "Preserve your fortune and destiny forever",
    emptyTitle: "No records yet",
    emptyDesc: "Start your saju analysis to create your own destiny record",
    startAnalysis: "Start Analysis",
    recentRecords: "Recent Records",
    guardian: "Guardian",
    viewDetail: "View Detail",
    export: "Export PDF",
    share: "Share",
    deleteRecord: "Delete",
    confirmDelete: "Are you sure you want to delete this?",
    sajuResult: "Saju Analysis Result",
    todayFortune: "Today's Fortune",
    compatibility: "Compatibility",
    faceReading: "Face Reading",
    unknown: "Unknown",
    created: "Created",
    records: "Records",
    totalRecords: "Total Records",
    cheongrium: "Cheonggiun",
  },
};

export function KeepsakesContent() {
  const locale = useLocale() as Locale;
  const t = LABELS[locale];
  const [history, setHistory] = useState<LocalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const localHistory = getLocalHistory();
        setHistory(localHistory);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const getGuardianForElement = (element?: ElementType) => {
    if (!element) return null;
    return GUARDIANS[element];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy.MM.dd", { locale: locale === "ko" ? ko : enUS });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 bg-[#F5F9FC]">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-[#0E4168] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#F5F9FC]">
      {/* Header Section */}
      <section className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          {/* 청기운 Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo-cheonggiun.png"
              alt="청기운"
              width={120}
              height={45}
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Stats Card */}
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#C4A35A]/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#C4A35A]" weight="fill" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.totalRecords}</p>
                  <p className="text-2xl font-bold text-gray-800">{history.length}</p>
                </div>
              </div>
              <div className="text-sm text-gray-400">{t.records}</div>
            </div>
          </Card>
        </div>
      </section>

      {/* Records List */}
      <section className="px-4 py-4">
        <div className="max-w-md mx-auto">
          {history.length > 0 ? (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t.recentRecords}</h2>
              <div className="space-y-3">
                {history.map((record, index) => {
                  // Extract dominantElement from saju result data
                  const dominantElement = record.type === 'saju'
                    ? ((record as LocalSajuHistory).resultData?.elementAnalysis?.dominant?.[0] as ElementType | undefined)
                    : undefined;
                  const guardian = dominantElement
                    ? getGuardianForElement(dominantElement)
                    : null;

                  // Get record title based on type
                  const getRecordTitle = () => {
                    switch (record.type) {
                      case 'saju':
                        return t.sajuResult;
                      case 'compatibility':
                        return t.compatibility;
                      case 'couple':
                        return t.compatibility;
                      case 'face-reading':
                        return t.faceReading;
                      default:
                        return t.unknown;
                    }
                  };

                  return (
                    <motion.div
                      key={record.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-white border border-gray-100 shadow-sm">
                        <div className="flex items-start gap-3">
                          {guardian ? (
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${guardian.color}15` }}
                            >
                              <Image
                                src={guardian.imagePath}
                                alt={guardian.name[locale]}
                                width={40}
                                height={40}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Star className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-gray-800">
                                {getRecordTitle()}
                              </h3>
                              <span className="text-xs text-gray-400">
                                {record.createdAt ? formatDate(record.createdAt) : ""}
                              </span>
                            </div>
                            {guardian && (
                              <p className="text-sm text-gray-500 mb-2">
                                {t.guardian}: {guardian.name[locale]}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Link href={`/saju/result?id=${record.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8 px-3 border-[#0E4168] text-[#0E4168]"
                                >
                                  {t.viewDetail}
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <Card className="p-8 bg-white border border-gray-100 shadow-sm text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Scroll className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t.emptyTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{t.emptyDesc}</p>
                <Link href="/saju">
                  <Button className="bg-[#0E4168] hover:bg-[#0a3152] text-white">
                    <Sparkle className="w-4 h-4 mr-2" weight="fill" />
                    {t.startAnalysis}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

      {/* Back to Cheongrium */}
      <section className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <Link href="/cheongrium">
            <Card className="p-4 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/logo-cheonggiun.png"
                    alt="청기운"
                    width={80}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
