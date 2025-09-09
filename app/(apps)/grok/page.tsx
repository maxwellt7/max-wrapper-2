import InputCapture from "@/components/(apps)/input/input";
import PaymentModal from "@/components/(ui-components)/paywall/Payment";
import { toolConfig } from "./toolConfig";
import { UserGenerations } from "@/components/(apps)/dashboard/text-generations";
import { supabase } from "@/lib/utils/supabase/service";
import {
  getUserGenerations,
  getSession,
  getUserCredits,
} from "@/lib/db/cached-queries";
import InfoCard from "./info";
import { GrokGenerationsList } from "./generations";

const REPORTS_PER_PAGE = 9;

async function getPublicGenerations(page: number = 1) {
  const start = (page - 1) * REPORTS_PER_PAGE;
  const end = start + REPORTS_PER_PAGE - 1;

  try {
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .ilike("type", `%${toolConfig.type}%`)
      .not("slug", "is", null);

    const { data: reports } = await supabase
      .from("generations")
      .select(
        `
        slug,
        input_data,
        output_data,
        title,
        created_at,
        model,
        description
      `
      )
      .ilike("type", `%${toolConfig.type}%`)
      .not("slug", "is", null)
      .order("created_at", { ascending: false })
      .range(start, end);

    return {
      reports:
        reports?.map((report) => ({
          title: report.title || "Untitled Grok Analysis",
          slug: report.slug,
          created_at: new Date(report.created_at).toLocaleDateString(),
          model: report.model,
          description:
            report.description ||
            report.input_data?.prompt?.slice(0, 120) + "...",
          output_data: report.output_data,
        })) || [],
      totalPages: Math.ceil((count || 0) / REPORTS_PER_PAGE),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { reports: [], totalPages: 0, currentPage: 1 };
  }
}

// The main page component where users can create new generations
export default async function Page(
  props: {
    searchParams: Promise<{ page?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const user = await getSession();

  let credits;
  let generations: any[] = [];

  if (user?.email) {
    if (toolConfig.paywall) {
      credits = await getUserCredits(user.id);
      if (credits < toolConfig.credits) return <PaymentModal />;
    }
    generations = await getUserGenerations(user.email, toolConfig.type);
  }

  const { reports, totalPages } = await getPublicGenerations(currentPage);

  return (
    <div data-theme={toolConfig.company.theme} className="bg-white">
      <GrokGenerationsList
        title="Recently Simulated Launches"
        reports={reports}
        currentPage={currentPage}
        totalPages={totalPages}
        paginationBaseUrl="/apps/grok"
      />
      <InputCapture
        toolConfig={toolConfig}
        userEmail={user ? user.email : undefined}
        credits={toolConfig.paywall ? credits : undefined}
        emptyStateComponent={<InfoCard />}
      />
      <UserGenerations generations={generations} generationType="grok" />
    </div>
  );
}
