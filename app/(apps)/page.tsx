import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AppsPage() {
  // Redirect to stacks - demo apps have been replaced
  redirect("/stacks");
}