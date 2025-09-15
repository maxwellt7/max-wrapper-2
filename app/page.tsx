import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to stacks instead of showing demo apps
  redirect("/stacks");
}
