import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { type AuthSession, auth } from "./auth";
import { createComment } from "./routes/create-comment";
import { createIssue } from "./routes/create-issue";
import { deleteComment } from "./routes/delete-comment";
import { deleteIssue } from "./routes/delete-issue";
import { getIssue } from "./routes/get-issue";
import { getIssueInteractions } from "./routes/get-issue-interactions";
import { listIssueComments } from "./routes/list-issue-comments";
import { listIssues } from "./routes/list-issues";
import { toggleIssueLike } from "./routes/toggle-issue-like";
import { updateComment } from "./routes/update-comment";
import { updateIssue } from "./routes/update-issue";

const app = new OpenAPIHono<{
  Variables: {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
  };
}>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          message: result.error.issues.map((i) => i.message).join(", "),
        },
        400,
      );
    }
  },
}).basePath("/api");

// CORS middleware for auth routes
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  }),
);

// Better Auth handler
app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// OpenAPI documentation - register BEFORE session middleware to avoid auth check
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Kanban API",
    description: "REST API for the Kanban application",
  },
});

// Scalar API reference UI - register BEFORE session middleware
app.get(
  "/docs",
  apiReference({
    url: "/api/openapi.json",
    theme: "purple",
    pageTitle: "Kanban API Documentation",
  }),
);

// Session middleware for all routes (except docs and openapi.json)
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
  } else {
    c.set("user", session.user);
    c.set("session", session.session);
  }

  return next();
});

// Issue routes
app.route("/", listIssues);
app.route("/", getIssueInteractions); // Register specific route before parameterized routes
app.route("/", getIssue);
app.route("/", createIssue);
app.route("/", updateIssue);
app.route("/", deleteIssue);
app.route("/", listIssueComments);

// Comment routes
app.route("/", toggleIssueLike);
app.route("/", createComment);
app.route("/", updateComment);
app.route("/", deleteComment);

export default app;
