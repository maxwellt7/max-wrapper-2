import { redirect } from "next/navigation";

export default function AppsPage() {
  // Redirect to stacks - demo apps have been replaced
  redirect("/stacks");
}