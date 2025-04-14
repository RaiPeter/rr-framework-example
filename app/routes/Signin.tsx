import React from "react";
import "./Signin.css";
import { data, Link, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";

export const action = async ({ request }: Route.ActionArgs) => {
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

  return redirect("/forums");
};

const Signin = (_: Route.ComponentProps) => {
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;

  return (
    <div className="login">
      <h1>Login</h1>
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
