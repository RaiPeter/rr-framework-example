import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/Navbar.tsx", [
    index("routes/home.tsx"),
    route("users", "./routes/Users.tsx"),
    route("forums", "./routes/Forums.tsx"),
    route("forums/:id", "./routes/Forum.tsx"),
    route("forums/:id/edit", "./routes/ForumEdit.tsx"),
    route("forums/:id/delete", "./routes/ForumDelete.tsx"),
    route("forums/new", "./routes/ForumNew.tsx"),
    route("comments/:id/delete", "./routes/CommentDelete.tsx"),
  ]),
  route("signup", "./routes/Signup.tsx"),
  route("signin", "./routes/Signin.tsx"),
] satisfies RouteConfig;
