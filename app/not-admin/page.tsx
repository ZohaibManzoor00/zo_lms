import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export default function NotAdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto">
            <ShieldX className="size-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription className="max-w-xs mx-auto">
            You are not authorized to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackButton className="w-full" icon={true} label="Back to home" />
        </CardContent>
      </Card>
    </div>
  );
}
