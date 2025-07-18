import { adminGetWalkthroughs } from "@/app/data/admin/admin-get-walkthroughs";
import { WalkthroughAccordionList } from "./_components/walkthrough-accordion-list";

export default async function CodeWalkthroughListPage() {
  const walkthroughs = await adminGetWalkthroughs();

  return (
    <>
      <h1 className="text-2xl font-bold">Code Walkthroughs</h1>
      <WalkthroughAccordionList walkthroughs={walkthroughs} />
    </>
  );
}
