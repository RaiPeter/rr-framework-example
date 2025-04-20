import React from "react";
import type { Route } from "./+types/Logout";
import { destroySession, getSession } from "~/sessions.server";
import { redirect } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  try {
    console.log("Logout action");

    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } catch (err) {
    console.error("Logout error", err);
  }
}
const Logout = () => {
  return <div></div>;
};

export default Logout;
