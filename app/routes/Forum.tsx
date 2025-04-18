import "./Forum.css";
import { data, Form, useFetcher } from "react-router";
import { db } from "~/db";
import { comments, posts, upvotes, users } from "~/db/schema";
import { eq, count, and } from "drizzle-orm";
import type { Route } from "./+types/Forum";
import { getSession } from "~/sessions.server";
import { FaArrowUp } from "react-icons/fa";
import { useEffect, useState } from "react";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const id = params.id;

  const postPromise = db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      created_at: posts.created_at,
      user_id: users.id,
      username: users.username,
    })
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .where(eq(posts.id, parseInt(id)));

  const commentsPromise = db
    .select({
      id: comments.id,
      content: comments.content,
      created_at: comments.created_at,
      user_id: users.id,
      username: users.username,
      email: users.email,
    })
    .from(comments)
    .innerJoin(users, eq(comments.user_id, users.id))
    .where(eq(comments.post_id, parseInt(id)));

  const upvotesCountPromise = db
    .select({ count: count() })
    .from(upvotes)
    .where(eq(upvotes.post_id, parseInt(id)));

  const [post, commentsWithUsers, upvotesCountResult] = await Promise.all([
    postPromise,
    commentsPromise,
    upvotesCountPromise,
  ]);

  const upvotesCount = upvotesCountResult[0]?.count ?? 0;

  let hasUpvoted = false;
  if (userId) {
    const existingUpvote = await db
      .select()
      .from(upvotes)
      .where(
        and(eq(upvotes.post_id, parseInt(id)), eq(upvotes.user_id, userId))
      );

    hasUpvoted = existingUpvote.length > 0;
  }

  return {
    post: post[0],
    comments: commentsWithUsers,
    upvotesCount,
    hasUpvoted,
    userId,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const paramId = params.id;
}

const Forum = ({ loaderData }: Route.ComponentProps) => {
  const {
    post: forum,
    comments,
    upvotesCount,
    hasUpvoted,
    userId,
  } = loaderData;
  const fetcher = useFetcher();
  const editFetcher = useFetcher();

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const handleEditCancel = () => {
    setEditingCommentId(null);
  };

  const handleEditClick = (comment: { id: number; content: string }) => {
    setEditingCommentId(comment.id);
  };

  useEffect(() => {
    if (
      editFetcher.state === "idle" &&
      editFetcher.data !== undefined &&
      !editFetcher.data?.error
    ) {
      setEditingCommentId(null);
    }
  }, [editFetcher.state, editFetcher.data]);

  return (
    <div>
      <div className="forum-container">
        <h2>discussion</h2>
        {forum && (
          <div key={forum.id} className="forum-card">
            <h2>{forum.title}</h2>
            <div className="forum-card-body">
              <div className="forum-card-header">
                <p>{forum.username} on</p>
                <p>
                  {new Date(forum.created_at).toLocaleDateString("en-us", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p>{forum.description}</p>
              <fetcher.Form method="post" action={`/forums/${forum.id}/upvote`}>
                <button className="forum-upvotes">
                  <FaArrowUp color={hasUpvoted ? "orange" : "gray"} />{" "}
                  {upvotesCount}
                </button>
              </fetcher.Form>
            </div>
          </div>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            {editingCommentId === comment.id ? (
              <div className="comment-card-edit">
                <editFetcher.Form
                  method="post"
                  action={`/comments/${comment.id}/edit`}
                >
                  <textarea name="content" defaultValue={comment.content} />
                  <br />
                  <div>
                    <button type="submit">Save</button>
                    <button onClick={handleEditCancel}>Cancel</button>
                  </div>
                </editFetcher.Form>
              </div>
            ) : (
              <div className="comment-card-body">
                <div className="comment-card-header">
                  <div>
                    <p>{comment.username} replied on</p>
                    <p>
                      {new Date(comment.created_at).toLocaleDateString(
                        "en-us",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>{" "}
                  {comment.user_id === userId && (
                    <div>
                      <button onClick={() => handleEditClick(comment)}>
                        Edit
                      </button>
                      <fetcher.Form
                        method="post"
                        action={`comments/${comment.id}/delete`}
                      >
                        <button type="submit">Delete</button>
                      </fetcher.Form>
                    </div>
                  )}
                </div>
                <p>{comment.content}</p>
              </div>
            )}
          </div>
        ))}
        <div className="comments">
          <fetcher.Form method="post" action={`comments/new`}>
            <div>
              <textarea
                id="comment"
                name="content"
                defaultValue=""
                required
                placeholder="Add a comment..."
              ></textarea>
            </div>
            <button type="submit">Submit</button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
};

export default Forum;
