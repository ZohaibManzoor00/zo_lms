import { adminGetWalkthroughs } from "@/app/data/admin/admin-get-walkthroughs";
import { StandaloneLessonForm } from "./_components/standalone-lesson-form";

export default async function StandaloneLessonCreationPage() {
  const allWalkthroughs = await adminGetWalkthroughs();

  return <StandaloneLessonForm allWalkthroughs={allWalkthroughs} />;
}
