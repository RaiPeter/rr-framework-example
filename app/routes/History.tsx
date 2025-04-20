import { getSession } from "~/sessions.server";
import { db } from "~/db";
import { comments, posts, upvotes, users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { Link, redirect } from "react-router";
import type { Route } from "./+types/History";
import "./History.css";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = {
    id: session.get("userId"),
    username: session.get("username"),
  };
  if (!user.id) {
    return redirect("/signin");
  }
  try {
    const userPostsPromise = db
      .select({
        id: posts.id,
        title: posts.title,
        created_at: posts.created_at,
      })
      .from(posts)
      .where(eq(posts.user_id, user.id));

    const userCommentsPromise = await db
      .select({
        id: comments.id,
        content: comments.content,
        created_at: comments.created_at,
        postId: posts.id,
        postTitle: posts.title,
        postAuthor: users.username,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.post_id, posts.id))
      .innerJoin(users, eq(posts.user_id, users.id))
      .where(eq(comments.user_id, user.id));

    const userUpvotesPromise = db
      .select({
        id: upvotes.id,
        created_at: upvotes.created_at,
        postId: posts.id,
        postTitle: posts.title,
        postAuthor: users.username,
      })
      .from(upvotes)
      .innerJoin(posts, eq(upvotes.post_id, posts.id))
      .innerJoin(users, eq(posts.user_id, users.id))
      .where(eq(upvotes.user_id, user.id));

    const [userPosts, userComments, userUpvotes] = await Promise.all([
      userPostsPromise,
      userCommentsPromise,
      userUpvotesPromise,
    ]);

    const userPostsWithType = userPosts.map((post) => ({
      ...post,
      type: "post",
    }));

    const userCommentsWithType = userComments.map((comment) => ({
      ...comment,
      type: "comment",
    }));
    const userUpvotesWithType = userUpvotes.map((upvote) => ({
      ...upvote,
      type: "upvote",
    }));

    const combinedHistory = [
      ...userPostsWithType,
      ...userCommentsWithType,
      ...userUpvotesWithType,
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return {
      combinedHistory,
      user,
    };
  } catch (err) {
    console.error("Error getting the history");
  }
}

const History = ({ loaderData }: Route.ComponentProps) => {
  const { combinedHistory: history, user } = loaderData || {
    combinedHistory: [],
    user: { id: null, username: "" },
  };

  return (
    <div className="history">
      <h2>History</h2>
      {history && (
        <div>
          {history.map((his: any) => (
            <div key={his.id}>
              {his.type === "comment" && (
                <p>
                  You commented on{" "}
                  {his.postAuthor === user.username
                    ? "your "
                    : `${his.postAuthor}'s `}
                  post titled "
                  <Link to={`/forums/${his.postId}`}>{his.postTitle}</Link>"" on{" "}
                  {new Date(his.created_at).toLocaleString("en-us", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {his.type === "post" && (
                <p>
                  You created a post titled "
                  <Link to={`/forums/${his.id}`}>{his.title}</Link>" on{" "}
                  {new Date(his.created_at).toLocaleString("en-us", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
              {his.type === "upvote" && (
                <p>
                  You upvoted{" "}
                  {his.postAuthor === user.username
                    ? "your "
                    : `${his.postAuthor}'s `}{" "}
                  post titled "
                  <Link to={`/forums/${his.postId}`}>{his.postTitle}</Link>" on{" "}
                  {new Date(his.created_at).toLocaleString("en-us", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
