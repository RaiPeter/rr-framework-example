import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { redirect } from "react-router";
import { getSession } from "~/sessions.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const session = await getSession();
  const userId = session.get("userId");
  if (!userId) {
    return redirect("/signin");
  }
}
export default function Home() {
  return <Welcome />;
}
