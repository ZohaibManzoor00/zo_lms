"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GithubIcon, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [githubPending, startGithubTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [githubLocked, setGithubLocked] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const signInWithGithub = async () => {
    if (githubLocked) return;
    setGithubLocked(true);
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with Github, you will be redirected...");
          },
          onError: () => {
            toast.error("Something went wrong");
            setGithubLocked(false);
          },
        },
      });
    });
  };

  const signInWithEmail = () => {
    startEmailTransition(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification OTP sent to your email");
            router.push(`/verify-email?email=${email}`);
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Login to your Github or Email Account</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <Button
          disabled={githubPending || githubLocked}
          className="w-full"
          variant="outline"
          onClick={signInWithGithub}
        >
          {githubPending || githubLocked ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing in with Github...</span>
            </>
          ) : (
            <>
              <GithubIcon className="size-4" />
              Sign in with Github
            </>
          )}
        </Button>

        <div className="pt-2">
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="email@example.com"
              required
            />
          </div>

          <Button
            disabled={emailPending || email === ""}
            className="w-full"
            onClick={signInWithEmail}
          >
            {emailPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sending Verification OTP...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
