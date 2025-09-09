import { TextToSpeechTab } from "./components/text-to-speech";
import AppInfo from "./info";
import Login from "@/components/(apps)/input/login";
import PaymentModal from "@/components/(ui-components)/paywall/Payment";
import { toolConfig } from "./toolConfig";
import {
  getSession,
  getUserCredits,
  getUserGenerations,
} from "@/lib/db/cached-queries";

export default async function Page() {
  // Get user session using cached query
  const user = await getSession();

  // Set up variables for user data
  let credits;
  let generations: any[] = [];

  if (user?.email) {
    if (toolConfig.paywall) {
      // Get credits using cached query
      credits = await getUserCredits(user.id);

      if (credits < toolConfig.credits) {
        return <PaymentModal />;
      }
    }

    // Get user generations using cached query
    generations = await getUserGenerations(user.email, toolConfig.type);
  }

  return (
    <section className="relative min-h-screen">
      <div className="flex flex-col md:flex-row items-start no-scrollbar">
        <div className="w-full px-8 md:w-1/2">
          {user?.email ? (
            <div className="mt-5 flex justify-center mb-6 mx-auto p-4">
              <TextToSpeechTab />
            </div>
          ) : (
            <Login />
          )}
        </div>
        <div className="w-full md:w-1/2 no-scrollbar">
          <AppInfo />
        </div>
      </div>
    </section>
  );
}
