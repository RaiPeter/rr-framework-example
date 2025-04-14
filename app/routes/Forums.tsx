import React from "react";
import { Link, useNavigate } from "react-router";
import { db } from "~/db";
import { posts, upvotes, users } from "~/db/schema";
import type { Route } from "../+types/root";
import { FaArrowUp } from "react-icons/fa";
import "./Forums.css";
import { desc, eq, count } from "drizzle-orm";

interface Forum {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  user_id: number;
  username: string;
  email: string;
  upvotes: number;
}

export const meta = () => {
  return [{ title: "Forums" }, { name: "description", content: "Forums" }];
};

export const loader = async () => {
  const allForums: Forum[] = await db
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
    .orderBy(desc(posts.created_at));

  const totalCountResult: { count: number }[] = await db
    .select({
      count: count(),
    })
    .from(posts);

  const totalCount: number = totalCountResult[0].count;

  return { allForums, totalCount };
};

const Forums = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();
  //   const limit = 5;
  //   const page = parseInt(searchParams.get("page") || "1");
  const { allForums: forums } = (loaderData ?? { allForums: [] }) as {
    allForums: Forum[];
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
                {/* {forum.user_id === user.id ? (
                  <div className="action-buttons">
                    <button
                      onClick={() => navigate(`/forums/${forum.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(forum.id)}>
                      Delete
                    </button>
                  </div>
                ) : (
                  ""
                )} */}
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
      {/* <div className="pagination">
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
      </div> */}
    </main>
  );
};

export default Forums;
