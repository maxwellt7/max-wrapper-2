import { ImagePlayground } from "./components/image-playground";
import { getRandomSuggestions } from "./components/suggestions";
import {
  getSession,
  getUserGenerations,
  getUserCredits,
} from "@/lib/db/cached-queries";
import { UserImageGenerations } from "./components/image-generations";
import Login from "@/components/(apps)/input/login";
import AppInfo from "./info";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Get user session using cached query
  const user = await getSession();

  // Set up variables for user data
  let generations: any[] = [];

  // If user is logged in, fetch their generations
  if (user?.email) {
    generations = await getUserGenerations(user.email, "image-ai");
  }

  return (
    <section className="relative min-h-screen">
      <div className="flex flex-col md:flex-row items-start no-scrollbar">
        <div className="w-full md:w-1/2 no-scrollbar">
          {user?.email ? (
            <>
              <ImagePlayground suggestions={getRandomSuggestions()} />
            </>
          ) : (
            <Login />
          )}
        </div>
        <div className="w-full md:w-1/2 no-scrollbar">
          <AppInfo />
        </div>
      </div>
      <UserImageGenerations generations={generations} />
    </section>
  );
}
