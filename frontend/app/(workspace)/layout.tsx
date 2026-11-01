import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Workspace } from "@/components/workspace/workspace";
import { isTokenValid } from "@/lib/auth/token";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token || !isTokenValid(token)) {
    redirect("/sign-in");
  }

  return <Workspace>{children}</Workspace>;
}

