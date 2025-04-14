import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signup", "./routes/Signup.tsx"),
  route("signin", "./routes/Signin.tsx"),
  route("users", "./routes/Users.tsx"),
  route("forums", "./routes/Forums.tsx"),
] satisfies RouteConfig;
