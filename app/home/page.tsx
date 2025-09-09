import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import { loops } from "@/lib/clients/loops";
import { apps } from "@/lib/ai/apps";
import { CardApp } from "@/components/(apps)/dashboard/card-app";
import { HeaderApps } from "@/components/(apps)/dashboard/header-apps";
import { FaqSection } from "@/components/(apps)/dashboard/faq-section";
import { DashboardLayout } from "@/components/(apps)/dashboard/layout";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth");
  }

  /// Once you have set up your Loops API key, you can uncomment the code below to create a contact in Loops when a user logs in
  // If contact already exists, it will simply return an error
  // const userMetadata = user.user_metadata;
  // const userEmail = user.email;
  // const userName = userMetadata.full_name || userMetadata.name;

  // if (userEmail) {
  //   const contactProperties = {
  //     purchased: false,
  //     ...(userName && { firstName: userName }),
  //   };

  //   await loops.createContact(userEmail, contactProperties);
  // }

  return (
    <DashboardLayout showGreeting={true}>
      <main className="mx-auto w-full px-6 lg:px-12 xl:px-16 max-w-screen-xl mb-auto relative bg-white">
        {/* Decorative background blur */}
        <div className="w-[600px] h-40 select-none pointer-events-none blur-[100px] opacity-50 absolute -rotate-12 -top-44 -left-20" />

        <HeaderApps />

        <div className="mt-14 flex flex-col gap-y-8">
          {apps.map((app) => (
            <CardApp key={app.href} {...app} />
          ))}
        </div>

        <FaqSection />
      </main>
    </DashboardLayout>
  );
}
