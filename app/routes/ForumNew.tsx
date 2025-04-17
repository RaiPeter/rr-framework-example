import { Form, redirect } from "react-router";
import "./ForumNew.css";
import { db } from "~/db";
import { posts } from "~/db/schema";
import { getSession } from "~/sessions.server";

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user_id = session.get("userId");

  const formData = await request.formData();
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  const result = await db
    .insert(posts)
    .values({ user_id, title, description })
    .returning();

  return redirect(`/forums/${result[0].id}`);
};

const ForumNew = () => {
  return (
    <div className="new-forum">
      <h1>New Discussion</h1>
      <Form method="post">
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" required />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" required></textarea>
        </div>
        <button type="submit">Start Discussion</button>
      </Form>
    </div>
  );
};

export default ForumNew;
