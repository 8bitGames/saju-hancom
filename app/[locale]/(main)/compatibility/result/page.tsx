import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CompatibilityResultContent } from "./CompatibilityResultContent";

interface PageProps {
  searchParams: Promise<{
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
  }>;
}

export default async function CompatibilityResultPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (!params.p1Name || !params.p1Year || !params.p2Name || !params.p2Year) {
    redirect("/compatibility");
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CompatibilityResultContent searchParams={params} />
    </Suspense>
  );
}
