import Image from "next/image";
import Link from "next/link";
import { type App } from "@/lib/ai/apps";

export function CardApp({
  href,
  title,
  shortDesc,
  image,
  techStack,
  simpleFeatures,
}: App) {
  return (
    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 bg-white hover:shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">{shortDesc}</p>
          </div>

          <div className="space-y-8">
            {/* simpleFeatures - Single Column */}
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-3">
                Demo app features
              </span>
              <ul className="space-y-2">
                {simpleFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack - Two Columns */}
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-3">
                Tech Stack
              </span>
              <div className="grid grid-cols-2 gap-x-12">
                {/* Left Column */}
                <ul className="space-y-2">
                  {techStack
                    .slice(0, Math.ceil(techStack.length / 2))
                    .map((tech) => (
                      <li
                        key={tech}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        {tech}
                      </li>
                    ))}
                </ul>
                {/* Right Column */}
                <ul className="space-y-2">
                  {techStack
                    .slice(Math.ceil(techStack.length / 2))
                    .map((tech) => (
                      <li
                        key={tech}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        {tech}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Complete SaaS Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-3">
              Complete SaaS Package
            </span>
            <p className="text-sm text-gray-600">
              Each demo includes everything else you need to launch your app:
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Auth & Database
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Payments (Stripe/LemonSqueezy)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Landing Pages & UI components
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Emails (Loops)
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                User Analytics
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Programmatic SEO ready
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <Link
              href={`${href}`}
              className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-black transition-colors"
            >
              Try Demo
            </Link>
            <Link
              href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
              target="_blank"
              rel="noopener"
              className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Purchase
            </Link>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="lg:w-[360px] aspect-[16/10] relative rounded-lg overflow-hidden bg-gray-50">
          <Image
            alt={`${title} thumbnail`}
            src={image}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>
      </div>
    </div>
  );
}
