import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SharedSajuResultContent } from "./SharedSajuResultContent";
import { getSajuResultById } from "@/lib/supabase/usage";

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function SharedSajuResultPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch the shared result
  const { success, result } = await getSajuResultById(id);

  if (!success || !result) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SharedSajuResultContent
        birthData={result.birthData}
        resultData={result.resultData}
      />
    </Suspense>
  );
}
