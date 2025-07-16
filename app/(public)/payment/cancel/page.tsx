import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Ban } from "lucide-react";

export default function EnrollmentCanceledPage() {
  return (
    <div className="w-full min-h-screen flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <CardContent>
          <div className="w-full flex justify-center">
            <Ban className="size-12 p-2 bg-red-500/30 text-red-500 rounded-full" />
          </div>

          <div className="text-center mt-3 w-full">
            <h2 className="text-xl font-semibold">Payment Cancelled</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight text-balance">
              Your payment was cancelled, you won&apos;t be charged. Please try
              again.
            </p>
            <div className="pt-5">
              <BackButton label="Back to home" className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
