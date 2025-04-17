import { eq } from "drizzle-orm";
import { redirect } from "react-router";
import { db } from "~/db";
import { comments } from "~/db/schema";
import { destroySession, getSession } from "~/sessions.server";
import type { Route } from "./+types/CommentDelete";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const commentId = params.id;

  if (!userId) {
    return redirect("/signin", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  await db.delete(comments).where(eq(comments.id, parseInt(commentId)));

  return redirect(`/forums`);
};
const CommentDelete = () => {
  return <div></div>;
};

export default CommentDelete;
