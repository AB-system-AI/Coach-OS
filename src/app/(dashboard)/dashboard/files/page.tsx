import { redirect } from "next/navigation";

/** Files nav alias — media library is the canonical storage UI. */
export default function FilesPage() {
  redirect("/dashboard/media");
}
