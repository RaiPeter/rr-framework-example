import { and, eq } from "drizzle-orm";
import { db } from "~/db";
import { upvotes } from "~/db/schema";
import { getSession } from "~/sessions.server";
import type { Route } from "./+types/AddUpvote";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const paramId = params.id;

  let hasUpvoted = false;
  if (userId) {
    const existingUpvote = await db
      .select()
      .from(upvotes)
      .where(
        and(eq(upvotes.post_id, parseInt(paramId)), eq(upvotes.user_id, userId))
      );

    hasUpvoted = existingUpvote.length > 0;
  }

  if (hasUpvoted && userId) {
    await db
      .delete(upvotes)
      .where(
        and(eq(upvotes.post_id, parseInt(paramId)), eq(upvotes.user_id, userId))
      );
  } else {
    await db.insert(upvotes).values({
      post_id: parseInt(paramId),
      user_id: userId,
    });
  }
};
const AddUpvote = () => {
  return <div></div>;
};

export default AddUpvote;
