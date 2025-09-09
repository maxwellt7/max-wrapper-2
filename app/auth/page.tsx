import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import AuthComponent from "@/components/(ui-components)/auth/auth-layout";
import { homePage } from "@/config";

export default async function AuthPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect(homePage);
  }

  return <AuthComponent />;
}
