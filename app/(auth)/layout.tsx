import Link from "next/link";
import { AppLogo } from "@/components/ui/app-logo";
import { BackButton } from "@/components/ui/back-button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <BackButton className={"absolute top-4 left-4" } />

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <AppLogo />
          ZoLMS
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="hover:text-primary hover:underline">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary hover:underline">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );
}
