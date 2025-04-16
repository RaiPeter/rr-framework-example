import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: number;
  username: string;
  email: string;
  isAuthenticated: boolean;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "_session",
      //   expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      secrets: ["s3cr3t"], // Replace with your own secret
    },
  });

export { getSession, commitSession, destroySession };
