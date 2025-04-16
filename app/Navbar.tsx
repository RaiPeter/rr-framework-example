import React from "react";
import "./Navbar.css";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { destroySession, getSession } from "./sessions.server";

export async function action(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

const Navbar = ({
  data,
}: {
  data: {
    username: string | undefined;
    isAuthenticated: boolean | undefined;
  };
}) => {
  const { username, isAuthenticated } = data;

  return (
    <nav>
      <div className="logo">
        <Link to="/forums">Forum</Link>
      </div>
      <div className="links">
        <Link to={"/forums/history"}>{isAuthenticated ? username : ""}</Link>
        <Form method="post">
          <button type="submit">Logout</button>
        </Form>
      </div>
    </nav>
  );
};

export default Navbar;
