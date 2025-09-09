import PdfLayout from "./components/pdf-layout";
import PaymentModal from "@/components/(ui-components)/paywall/Payment";
import { toolConfig } from "./toolConfig";
import AppInfo from "./info";
import {
  getSession,
  getUserCredits,
  getUserPdfDocuments,
} from "@/lib/db/cached-queries";

export default async function Page() {
  const user = await getSession();

  let credits;
  let documents;

  if (user) {
    if (toolConfig.paywall) {
      credits = await getUserCredits(user.id);

      if (credits < toolConfig.credits) {
        return <PaymentModal />;
      }
    }

    documents = await getUserPdfDocuments(user.id);
  }

  return (
    <section className="relative min-h-screen">
      <div className="flex flex-col md:flex-row items-start no-scrollbar">
        <div className="w-full md:w-1/2 no-scrollbar">
          <PdfLayout
            userEmail={user ? user.email : undefined}
            documents={documents}
            credits={credits}
          />
        </div>
        <div className="w-full md:w-1/2 no-scrollbar">
          <AppInfo />
        </div>
      </div>
    </section>
  );
}
