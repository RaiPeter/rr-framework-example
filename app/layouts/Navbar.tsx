import "./Navbar.css";
import { Form, Link, Outlet, redirect } from "react-router";
import { destroySession, getSession } from "../sessions.server";
import type { Route } from "./+types/Navbar";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return {
    username: session.get("username"),
    isAuthenticated: session.get("isAuthenticated"),
  };
}

export async function action(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

const Navbar = ({ loaderData }: Route.ComponentProps) => {
  const { username, isAuthenticated } = loaderData;
  return (
    <div>
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
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Navbar;
