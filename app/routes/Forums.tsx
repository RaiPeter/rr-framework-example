import { Form, Link, useNavigate, useSearchParams } from "react-router";
import { db } from "~/db";
import { posts, upvotes, users } from "~/db/schema";
import { FaArrowUp } from "react-icons/fa";
import "./Forums.css";
import { desc, eq, count } from "drizzle-orm";
import type { Route } from "./+types/Forums";
import { getSession } from "~/sessions.server";

export const meta = () => {
  return [{ title: "Forums" }, { name: "description", content: "Forums" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 5;
  const offset = (page - 1) * limit;

  const session = await getSession(request.headers.get("Cookie"));
  const user = {
    id: session.get("userId"),
    username: session.get("username"),
    isAuthenticated: session.get("isAuthenticated"),
  };

  const allForumsPromise = db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      created_at: posts.created_at,
      user_id: users.id,
      username: users.username,
      email: users.email,
      upvotes: count(upvotes.id),
    })
    .from(posts)
    .innerJoin(users, eq(posts.user_id, users.id))
    .leftJoin(upvotes, eq(upvotes.post_id, posts.id))
    .groupBy(posts.id, users.id)
    .orderBy(desc(posts.created_at))
    .limit(limit)
    .offset(offset);

  const totalCountResultPromise = db
    .select({
      count: count(),
    })
    .from(posts);

  const [allForums, totalCountResult] = await Promise.all([
    allForumsPromise,
    totalCountResultPromise,
  ]);

  const totalCount: number = totalCountResult[0].count;
  const totalPages = Math.ceil(totalCount / limit);

  return { allForums, totalCount, totalPages, page, user };
};

const Forums = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allForums: forums, totalCount, totalPages, page, user } = loaderData;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    navigate(`?${params.toString()}`);
  };

  return (
    <main>
      <div className="header">
        <label htmlFor="forums">Forums</label>
        <Link to={"/forums/new"}>Start New discussion</Link>
      </div>
      {forums &&
        forums.map((forum) => (
          <div key={forum.id} className="forums">
            <div className="upvotes">
              <FaArrowUp />
              {forum.upvotes}
            </div>
            <div className="card-body">
              <div className="card-header">
                <div>
                  <h2 onClick={() => navigate(`/forums/${forum.id}`)}>
                    {forum.title}
                  </h2>
                </div>
                {forum.user_id === user.id ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => navigate(`/forums/${forum.id}/edit`)}
                    >
                      Edit
                    </button>
                    <Form
                      method="post"
                      action={`/forums/${forum.id}/delete`}
                      onSubmit={(event) => {
                        const response = confirm(
                          "Please confirm you want to delete this record."
                        );
                        if (!response) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <button type="submit">Delete</button>
                    </Form>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="card-footer">
                <p>{forum.username} asked on</p>
                <p>
                  {new Date(forum.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
};

export default Forums;
