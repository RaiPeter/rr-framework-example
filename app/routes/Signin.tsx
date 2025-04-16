import "./Signin.css";
import { data, Link, redirect, useFetcher } from "react-router";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { commitSession, getSession } from "~/sessions.server";
import type { Route } from "./+types/Signin";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/forums");
  }

  return data(
    { error: session.get("error") },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action = async ({ request }: Route.ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const errors = {} as { email?: string; password?: string };

  if (!email.includes("@")) {
    errors.email = "Email is invalid";
  }

  if (password.length < 5) {
    errors.password = "Password should be at least 5 character long";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length === 0) {
    console.log("User not found", existingUser[0]);
    errors.email = "User not found";
    return data({ errors }, { status: 400 });
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser[0].password
  );

  if (!isPasswordValid) {
    console.log("Invalid password");
    session.flash("error", "Invalid username/password");

    return redirect("/signin", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", existingUser[0].id);
  session.set("username", existingUser[0].username);
  session.set("email", existingUser[0].email);
  session.set("isAuthenticated", true);

  return redirect("/forums", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const Signin = ({ loaderData }: Route.ComponentProps) => {
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors || {};

  const error = loaderData?.error;

  return (
    <div className="login">
      <h1>Login</h1>
      {error ? <div className="error">{error}</div> : null}
      <fetcher.Form method="post">
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" />
          {errors?.email ? <em>{errors.email}</em> : null}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
          {errors?.password ? <em>{errors.password}</em> : null}
        </div>
        <div>
          Don't have an account? <Link to={"/signup"}>Signup</Link>
        </div>
        <button type="submit">Login</button>
      </fetcher.Form>
    </div>
  );
};

export default Signin;
