import { data, Link, redirect, useFetcher } from "react-router";
import type { Route } from "../+types/root";
import "./Signup.css";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: Date;
}
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const userName = String(formData.get("username"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const errors: { email?: string; password?: string } = {};

  if (!email.includes("@")) {
    errors.email = "Email is invalide";
  }

  if (password.length < 5) {
    errors.password = "Password should be at least 5 character long";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const user: User[] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (user.length > 0) {
    errors.email = "Email already exists";
    console.error("email already exists", user[0].email);
    return data({ errors }, { status: 400 });
  }

  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  const [newUser]: User[] = await db
    .insert(users)
    .values({
      username: userName,
      email: email,
      password: hashedPassword,
    })
    .returning();

  if (!newUser) {
    errors.email = "Error creating user";
    return data({ errors }, { status: 400 });
  }

  console.log("create new user", newUser);

  return redirect("/forums");
};

const Signup = (_: Route.ComponentProps) => {
  let fetcher = useFetcher();
  let errors = fetcher.data?.errors || {};

  return (
    <div className="signup">
      <h1>Signup</h1>
      <fetcher.Form method="post">
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" />
          {errors?.email ? <em>{errors.email}</em> : null}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" />
          {errors?.password ? <em>{errors.password}</em> : null}
        </div>
        <div>
          Have an account already? <Link to={"/signin"}>Signin</Link>
        </div>
        <button type="submit">Signup</button>
      </fetcher.Form>
    </div>
  );
};

export default Signup;
