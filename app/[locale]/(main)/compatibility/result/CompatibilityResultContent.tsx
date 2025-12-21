"use client";

import { Link } from "@/lib/i18n/navigation";
import { Users, ArrowCounterClockwise, ChatCircle, Handshake, Heart, ChartBar, Sparkle, User } from "@/components/ui/icons";
import { ELEMENT_KOREAN } from "@/lib/saju";
import { calculatePersonCompatibility } from "@/lib/compatibility/calculator";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import { SparklesCore } from "@/components/aceternity/sparkles";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { Spotlight } from "@/components/aceternity/spotlight";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import type { Gender } from "@/lib/saju/types";
import type { CompatibilityGrade, RelationType } from "@/lib/compatibility/types";

interface SearchParams {
  p1Name?: string;
  p1Year?: string;
  p1Month?: string;
  p1Day?: string;
  p1Hour?: string;
  p1Minute?: string;
  p1Gender?: string;
  p1IsLunar?: string;
  p1City?: string;
  p2Name?: string;
  p2Year?: string;
  p2Month?: string;
  p2Day?: string;
  p2Hour?: string;
  p2Minute?: string;
  p2Gender?: string;
  p2IsLunar?: string;
  p2City?: string;
  relationType?: string;
}

function getGradeColor(grade: CompatibilityGrade): string {
  switch (grade) {
    case "excellent":
      return "from-[var(--element-fire)] to-[var(--accent)]";
    case "good":
      return "from-[var(--element-wood)] to-[var(--element-fire)]";
    case "normal":
      return "from-[var(--element-earth)] to-[var(--element-metal)]";
    case "caution":
      return "from-[var(--element-metal)] to-[var(--element-water)]";
    case "challenging":
      return "from-[var(--element-water)] to-gray-500";
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[var(--element-fire)]";
  if (score >= 60) return "text-[var(--element-wood)]";
  if (score >= 40) return "text-[var(--text-primary)]";
  return "text-[var(--element-water)]";
}

function getRelationTypeKorean(type?: string): string {
  switch (type) {
    case "colleague": return "동료";
    case "supervisor": return "상사";
    case "subordinate": return "부하";
    case "partner": return "파트너";
    case "client": return "고객";
    case "mentor": return "멘토";
    case "mentee": return "멘티";
    default: return "동료";
  }
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs sm:text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className={`font-medium ${getScoreColor(score)}`}>{score}점</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function PersonPillarsDisplay({
  name,
  pillars,
  label
}: {
  name: string;
  pillars: { year: { gan: string; zhi: string }; month: { gan: string; zhi: string }; day: { gan: string; zhi: string }; time: { gan: string; zhi: string } };
  label: string;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" weight="fill" />
        <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">{label}: {name}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {(["year", "month", "day", "time"] as const).map((pillar) => {
          const p = pillars[pillar];
          return (
            <div
              key={pillar}
              className="text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--background-elevated)]"
            >
              <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)] mb-0.5 sm:mb-1">
                {pillar === "year" ? "년" : pillar === "month" ? "월" : pillar === "day" ? "일" : "시"}
              </p>
              <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {p.gan}{p.zhi}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompatibilityResultContent({ searchParams }: { searchParams: SearchParams }) {
  // Person 1 data
  const person1 = {
    name: searchParams.p1Name || "본인",
    year: parseInt(searchParams.p1Year || "1990"),
    month: parseInt(searchParams.p1Month || "1"),
    day: parseInt(searchParams.p1Day || "1"),
    hour: parseInt(searchParams.p1Hour || "12"),
    minute: parseInt(searchParams.p1Minute || "0"),
    gender: (searchParams.p1Gender as Gender) || "male",
    isLunar: searchParams.p1IsLunar === "true",
    city: searchParams.p1City || "서울",
  };

  // Person 2 data
  const person2 = {
    name: searchParams.p2Name || "상대방",
    year: parseInt(searchParams.p2Year || "1990"),
    month: parseInt(searchParams.p2Month || "1"),
    day: parseInt(searchParams.p2Day || "1"),
    hour: parseInt(searchParams.p2Hour || "12"),
    minute: parseInt(searchParams.p2Minute || "0"),
    gender: (searchParams.p2Gender as Gender) || "male",
    isLunar: searchParams.p2IsLunar === "true",
    city: searchParams.p2City || "서울",
  };

  const relationType = searchParams.relationType as RelationType | undefined;

  const result = calculatePersonCompatibility(person1, person2, relationType);

  // Build query string for AI result link
  const queryString = new URLSearchParams({
    p1Name: person1.name,
    p1Year: person1.year.toString(),
    p1Month: person1.month.toString(),
    p1Day: person1.day.toString(),
    p1Hour: person1.hour.toString(),
    p1Minute: person1.minute.toString(),
    p1Gender: person1.gender,
    p1IsLunar: person1.isLunar.toString(),
    p1City: person1.city,
    p2Name: person2.name,
    p2Year: person2.year.toString(),
    p2Month: person2.month.toString(),
    p2Day: person2.day.toString(),
    p2Hour: person2.hour.toString(),
    p2Minute: person2.minute.toString(),
    p2Gender: person2.gender,
    p2IsLunar: person2.isLunar.toString(),
    p2City: person2.city,
    relationType: relationType || "",
  }).toString();

  return (
    <div className="relative min-h-screen pb-4 sm:pb-6">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 -right-10 md:right-40 md:-top-20"
        fill="var(--element-water)"
      />

      <div className="space-y-4 sm:space-y-6 animate-fade-in relative z-10">
        {/* Header with Premium Effects */}
        <div className="relative text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="compatibility-result-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={30}
              particleColor="var(--element-water)"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10">
            <BackgroundGradient
              className="rounded-xl sm:rounded-2xl p-4 sm:p-5"
              containerClassName="mx-auto w-fit"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold text-white">{result.score}</span>
              </div>
            </BackgroundGradient>
          </div>

          <div className="relative z-10 px-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {result.gradeText}
            </h1>
            <TextGenerateEffect
              words={`${person1.name}님과 ${person2.name}님의 ${getRelationTypeKorean(relationType)} 궁합`}
              className="text-sm sm:text-base text-[var(--text-secondary)]"
              duration={0.2}
            />
          </div>
        </div>

        {/* Two Person Pillars */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 backdrop-blur-xl border border-[var(--border)]/50">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" weight="fill" />
            <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">두 사람의 사주</h2>
          </div>

          <PersonPillarsDisplay
            name={person1.name}
            pillars={result.person1Pillars}
            label="첫 번째"
          />

          <div className="border-t border-[var(--border)]/30 my-3 sm:my-4" />

          <PersonPillarsDisplay
            name={person2.name}
            pillars={result.person2Pillars}
            label="두 번째"
          />
        </section>

        {/* Analysis Cards */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 backdrop-blur-xl border border-[var(--border)]/50">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" weight="fill" />
            <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">관계 분석</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ChatCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-wood)]" weight="fill" />
                <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">소통</span>
              </div>
              <ScoreBar score={result.analysis.communication.score} label="" />
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                {result.analysis.communication.description}
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-fire)]" weight="fill" />
                <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">협업</span>
              </div>
              <ScoreBar score={result.analysis.collaboration.score} label="" />
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                {result.analysis.collaboration.description}
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-earth)]" weight="fill" />
                <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">신뢰</span>
              </div>
              <ScoreBar score={result.analysis.trust.score} label="" />
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                {result.analysis.trust.description}
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ChartBar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--element-metal)]" weight="fill" />
                <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">성장</span>
              </div>
              <ScoreBar score={result.analysis.growth.score} label="" />
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)]">
                {result.analysis.growth.description}
              </p>
            </div>
          </div>
        </section>

        {/* Element Balance */}
        <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 backdrop-blur-xl border border-[var(--border)]/50">
          <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">오행 균형</h2>
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {(["wood", "fire", "earth", "metal", "water"] as const).map((element) => {
              const person1Score = result.elementBalance.person1[element];
              const person2Score = result.elementBalance.person2[element];
              return (
                <div
                  key={element}
                  className={`text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--element-${element})]/10 border border-[var(--element-${element})]/20`}
                >
                  <p className="text-[10px] sm:text-xs font-medium text-[var(--text-primary)]">
                    {ELEMENT_KOREAN[element]}
                  </p>
                  <p className="text-xs sm:text-sm font-bold" style={{ color: `var(--element-${element})` }}>
                    {person1Score}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">
                    vs {person2Score}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Relationship Advice */}
        {result.relationshipAdvice.length > 0 && (
          <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 backdrop-blur-xl border border-[var(--border)]/50">
            <h2 className="text-sm sm:text-base font-semibold text-[var(--element-wood)]">관계 조언</h2>
            <ul className="space-y-1.5 sm:space-y-2">
              {result.relationshipAdvice.map((advice, i) => (
                <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--element-wood)]">&#10004;</span>
                  {advice}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cautions */}
        {result.cautions.length > 0 && (
          <section className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3 backdrop-blur-xl border border-[var(--border)]/50">
            <h2 className="text-sm sm:text-base font-semibold text-[var(--element-fire)]">주의 사항</h2>
            <ul className="space-y-1.5 sm:space-y-2">
              {result.cautions.map((caution, i) => (
                <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--element-fire)]">&#9888;</span>
                  {caution}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Actions */}
        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
          <Link href={`/compatibility/ai-result?${queryString}`} className="block">
            <HoverBorderGradient
              containerClassName="w-full rounded-lg sm:rounded-xl"
              className="w-full h-12 sm:h-14 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--element-fire)] text-white text-sm sm:text-base font-bold rounded-lg sm:rounded-xl"
              as="div"
            >
              <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
              상세 분석 보기
            </HoverBorderGradient>
          </Link>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/compatibility" className="flex-1">
              <div className="h-12 sm:h-14 rounded-lg sm:rounded-xl glass-card border border-[var(--border)]/50 flex items-center justify-center gap-1.5 sm:gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <ArrowCounterClockwise className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">다시 분석</span>
              </div>
            </Link>
            <Link href="/saju" className="flex-1">
              <div className="h-12 sm:h-14 rounded-lg sm:rounded-xl glass-card border border-[var(--border)]/50 flex items-center justify-center gap-1.5 sm:gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" weight="fill" />
                <span className="text-sm sm:text-base font-medium">사주 분석</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs sm:text-sm text-[var(--text-tertiary)] pt-2 pb-6 sm:pb-8">
          이 분석은 전통 명리학을 기반으로 한 참고용 정보입니다.
        </p>
      </div>
    </div>
  );
}
