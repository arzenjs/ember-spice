import { redirect } from "next/navigation";
import { resolvePostLoginPath } from "@/lib/safe-redirect";
import { requireUser } from "@/server/session";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Landing page right after sign-in. The destination comes from the role stored in the database,
// never from anything the browser submitted, and `next` is only honoured when that role may visit it.
export default async function PostLoginPage({ searchParams }) {
  const { next } = await searchParams;
  const user = await requireUser();
  redirect(resolvePostLoginPath(user.role, next));
}
