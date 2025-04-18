import { db } from "~/db";
import type { Route } from "./+types/CommentAdd";
import { comments } from "~/db/schema";
import { getSession } from "~/sessions.server";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  const formdata = await request.formData();
  const paramId = params.id;
  const comment = await db
    .insert(comments)
    .values({
      content: String(formdata.get("content")),
      post_id: parseInt(paramId),
      user_id: userId,
    })
    .returning({ id: comments.id });

  return comment[0];
};

const CommentAdd = () => {
  return <div></div>;
};

export default CommentAdd;
