import { StudioClient } from "./components/studio-client";
import { StudioInfo } from "./info";
import Login from "@/components/(apps)/input/login";
import { getSession, getUserGenerations } from "@/lib/db/cached-queries";
import { StudioGenerations } from "./components/studio-generations";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const user = await getSession();

  let generations: any[] = [];
  if (user?.email) {
    try {
      generations = await getUserGenerations(user.email, "studio");
    } catch (error) {
      console.error("Failed to fetch studio generations:", error);
    }
  }

  return (
    <div className="flex-1 w-full">
      {/* Main content area */}
      <div className="mb-8">
        {user?.email ? (
          <StudioClient />
        ) : (
          <div className="flex flex-col items-center justify-center h-full pt-10">
            <Login />
          </div>
        )}
      </div>

      {/* Info section as a horizontal banner */}
      <div className="w-full mb-8">
        <StudioInfo />
      </div>

      {/* Generations section */}
      {user?.email && generations.length > 0 && (
        <div className="w-full mt-4 border-t border-gray-100 p-4 md:p-6">
          <StudioGenerations generations={generations} />
        </div>
      )}
    </div>
  );
}
