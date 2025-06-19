"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed out Successfully");
        },
      },
    });
  };

  return (
    <div>
      <h1>Hello </h1>
      <ThemeToggle />

      {session ? (
        <div>
          <p>{session.user.name}</p>
          <Button onClick={signOut}>Logout</Button>
        </div>
      ) : (
        <Button onClick={() => router.push("/login")}>Login</Button>
      )}
    </div>
  );
}
