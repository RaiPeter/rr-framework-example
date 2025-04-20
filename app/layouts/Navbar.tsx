import "./Navbar.css";
import { Form, Link, Outlet, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/Navbar";
import { getSession } from "~/sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return {
    username: session.get("username"),
    isAuthenticated: session.get("isAuthenticated"),
  };
}

const Navbar = ({ loaderData }: Route.ComponentProps) => {
  const { username, isAuthenticated } = loaderData;
  return (
    <div>
      <nav>
        <div className="logo">
          <Link to={"/forums"}>Forum</Link>
        </div>
        <div className="links">
          <Link to={"/users/history"}>{isAuthenticated ? username : ""}</Link>
          <Form method="post" action="/logout">
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
