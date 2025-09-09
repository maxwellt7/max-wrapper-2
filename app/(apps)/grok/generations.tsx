"use client";

import { Calendar, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

function GrokGenerationCard({ report, href }: any) {
  const stats = report.output_data?.launchStats ?? {};

  return (
    <Link href={href}>
      <article
        className="w-[400px] bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-xl 
        rounded-2xl border border-white/20 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
        transition-all duration-200 flex flex-col min-h-[225px]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <Calendar className="w-4 h-4" />
            <time className="text-sm tracking-tight">{report.created_at}</time>
          </div>
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 bg-zinc-100/70 dark:bg-zinc-900/70 
            rounded-full text-xs font-normal text-zinc-700 dark:text-zinc-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {report.model}
          </div>
        </div>

        <div className="flex-1">
          <h3
            className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-200 mb-2.5 
            tracking-tight leading-snug"
          >
            {report.title}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
            {report.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-[13px] pt-5">
          <div className="flex gap-5 text-zinc-500 font-medium tracking-tight">
            <span className="flex items-center gap-1.5">
              <span className="opacity-70">↑</span> {stats.upvotes ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="opacity-70">💬</span> {stats.comments ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="opacity-70">⭐</span> {stats.launchScore ?? 0}%
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400" />
        </div>
      </article>
    </Link>
  );
}

export function GrokGenerationsList({
  title,
  reports,
  currentPage,
  totalPages,
  paginationBaseUrl,
}: {
  title: string;
  reports: any[];
  currentPage: number;
  totalPages: number;
  paginationBaseUrl: string;
}) {
  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <h2
        className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-8 px-2 
        tracking-tight"
      >
        {title}
      </h2>
      <div className="flex gap-5 overflow-x-auto pb-8 px-2 no-scrollbar">
        {reports.map((report) => (
          <GrokGenerationCard
            key={report.slug}
            report={report}
            href={`/apps/grok/${report.slug}`}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i + 1}
              href={`${paginationBaseUrl}${i === 0 ? "" : `?page=${i + 1}`}`}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 
                ${
                  currentPage === i + 1
                    ? "bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200 font-medium"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
