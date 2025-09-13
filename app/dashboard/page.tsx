import { requireUser } from "@/app/data/user/require-user";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">{user.name}&apos;s Dashboard</h1>
    </div>
  );
}
