'use client'

import { useTransition } from "react";
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
import { GithubIcon, Loader2 } from "lucide-react";

export default function LoginForm() {
    const [githubPending, startGithubTransition] = useTransition();

    const signInWithGithub = async () => {
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
          disabled={githubPending}
          className="w-full"
          variant="outline"
          onClick={signInWithGithub}
        >
          {githubPending ? (
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
            <Input id="email" placeholder="email@example.com" />
          </div>

          <Button className="w-full">Continue with Email</Button>
        </div>
      </CardContent>
    </Card>
  )
}
