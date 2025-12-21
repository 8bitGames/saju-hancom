import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SajuResultContent } from "./SajuResultContent";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
    minute?: string;
    gender?: string;
    isLunar?: string;
    city?: string;
  }>;
}

export default async function SajuResultPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Validate required params
  if (!params.year || !params.month || !params.day) {
    redirect("/saju");
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SajuResultContent searchParams={params} />
    </Suspense>
  );
}
