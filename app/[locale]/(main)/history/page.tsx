import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSajuResults } from "@/lib/supabase/usage";
import { HistoryList } from "./history-list";
import { EmptyHistory } from "./empty-history";

export default async function HistoryPage() {
  const t = await getTranslations("history");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  let results: any[] = [];

  if (user) {
    const { results: sajuResults } = await getUserSajuResults(user.id);
    results = sajuResults;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <p className="text-[#22c55e] text-sm font-medium tracking-wider">
          分析記錄
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
      </div>

      {results.length > 0 ? (
        <HistoryList results={results} />
      ) : (
        <EmptyHistory />
      )}
    </div>
  );
}
