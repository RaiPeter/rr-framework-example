import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { destroySession, getSession } from "~/sessions.server";
import type { Route } from "./+types/ForumDelete";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const forumId = params.id;

  if (!userId) {
    return redirect("/signin", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  await db.delete(posts).where(eq(posts.id, parseInt(forumId)));

  return redirect(`/forums`);
};
const ForumDelete = () => {
  return <div></div>;
};

export default ForumDelete;
