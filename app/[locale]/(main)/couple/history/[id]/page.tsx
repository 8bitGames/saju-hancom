import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoupleResultById } from "@/lib/supabase/usage";
import { CoupleHistoryContent } from "./couple-history-content";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CoupleHistoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { success, result } = await getCoupleResultById(user.id, id);

  if (!success || !result) {
    notFound();
  }

  return <CoupleHistoryContent result={result} />;
}
