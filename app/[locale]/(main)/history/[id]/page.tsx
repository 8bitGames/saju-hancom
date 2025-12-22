import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { HistoryDetailContent } from "./history-detail-content";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function HistoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("history");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: result, error } = await supabase
    .from("saju_results")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !result) {
    notFound();
  }

  return <HistoryDetailContent result={result} />;
}
