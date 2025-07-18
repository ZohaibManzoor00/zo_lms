import { WalkthroughRecorderClient } from "../walkthrough-recorder-client";
import { adminCreateWalkthrough } from "@/app/data/admin/admin-create-walkthrough";

export default function CodeWalkthroughRecordPage() {
  async function saveWalkthrough(
    data: Parameters<typeof adminCreateWalkthrough>[0]
  ) {
    "use server";
    return await adminCreateWalkthrough(data);
  }
  return <WalkthroughRecorderClient saveWalkthrough={saveWalkthrough} />;
}
