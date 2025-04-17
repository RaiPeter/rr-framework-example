import { db } from "~/db";
import type { Route } from "./+types/ForumEdit";
import { posts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Form, redirect } from "react-router";
import "./ForumEdit.css";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const forumId = params.id;
  const forum = await db
    .select()
    .from(posts)
    .where(eq(posts.id, parseInt(forumId)))
    .limit(1);

  return { forum: forum[0] };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const forumId = params.id;

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  await db
    .update(posts)
    .set({ title, description })
    .where(eq(posts.id, parseInt(forumId)));

  return redirect(`/forums/${params.id}`);
};

const ForumEdit = ({ loaderData }: Route.ComponentProps) => {
  const { forum } = loaderData;

  return (
    <div className="edit-forum">
      <h1>Edit Forum</h1>
      <Form id="contact-form" method="post">
        {forum && (
          <>
            <div>
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={forum.title}
              />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                required
                defaultValue={forum.description}
              ></textarea>
            </div>
            <button type="submit">Edit Forum</button>
          </>
        )}
      </Form>
    </div>
  );
};

export default ForumEdit;
