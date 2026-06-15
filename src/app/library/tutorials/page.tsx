import { redirect } from "next/navigation";

export default function TutorialsRedirect() {
  redirect("/library?tab=tutorials");
}
