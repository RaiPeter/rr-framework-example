import { eq } from "drizzle-orm";
import { db } from "~/db";
import { comments } from "~/db/schema";
import type { Route } from "./+types/CommentEdit";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, parseInt(params.id)));

  return comment[0];
};

export const action = async ({ request, params }: any) => {
  const formdata = await request.formData();

  const paramId = params.id;

  const comment = await db
    .update(comments)
    .set({
      content: formdata.get("content"),
    })
    .where(eq(comments.id, parseInt(paramId)));

  return comment;
};
const CommentEdit = ({ loaderData }: Route.ComponentProps) => {
  const data = loaderData;
  console.log("CommentEdit", data);
  return <div>{JSON.stringify(data)}</div>;
};

export default CommentEdit;
