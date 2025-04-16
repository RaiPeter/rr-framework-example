import "./Forum.css";
import { data } from "react-router";
import { db } from "~/db";
import { comments, posts, upvotes, users } from "~/db/schema";
import { eq, count } from "drizzle-orm";
import type { Route } from "./+types/Forum";

export async function loader({ params }: Route.LoaderArgs) {
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

  return {
    post: post[0],
    comments: commentsWithUsers,
    upvotesCount,
  };
}

export async function action({ request, params }: Route.ActionArgs) {}

const Forum = ({ loaderData }: Route.ComponentProps) => {
  const { post, comments, upvotesCount } = loaderData;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <p>Created by: {post.username}</p>
      <p>Upvotes: {upvotesCount}</p>
      {/* <button>{hasUpvoted ? "Remove Upvote" : "Upvote"}</button> */}
      <h2>Comments</h2>
      {comments.map((comment: any) => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <p>Commented by: {comment.username}</p>
        </div>
      ))}
    </div>
  );
};

export default Forum;
