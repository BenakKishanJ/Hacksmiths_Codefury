import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to the home page
  redirect("/home");
}
