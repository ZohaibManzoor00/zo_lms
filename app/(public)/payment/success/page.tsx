"use client";

import { useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useConfetti } from "@/hooks/use-confetti";
import { CheckIcon, PartyPopperIcon } from "lucide-react";
import { ForwardButton } from "@/components/ui/forward-button";

export default function EnrollmentSuccessfulPage() {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    triggerConfetti();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <CardContent>
          <div className="w-full flex justify-center">
            <CheckIcon className="size-12 p-2 bg-green-500/30 text-green-500 rounded-full" />
          </div>

          <div className="text-center mt-3 w-full">
            <h2 className="text-xl font-semibold">Payment Successful</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight text-balance">
              Congratulations! You have successfully enrolled in the course. You
              can now start learning.
            </p>
            <div className="mt-5">
              <ForwardButton label="View in dashboard" className="w-full" icon={PartyPopperIcon} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
