import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Ban } from "lucide-react";
import Link from "next/link";

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
              Your payment was cancelled, you won't be charged. Please try
              again.
            </p>

            <Link
              href="/"
              className={buttonVariants({ className: "w-full mt-5" })}
            >
              <ArrowLeft className="size-4" />
              Go back to Homepage
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
