import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import type { AuthSession } from "../auth";
import { db } from "../db";
import { comments, issues } from "../db/schema";
import { requireAuth } from "../middlewares/auth";

export const CreateCommentSchema = z.object({
  text: z.string().min(1),
});

export const CommentAuthorSchema = z.object({
  name: z.string(),
  avatar: z.url(),
});

export const CommentSchema = z.object({
  id: z.uuidv4(),
  issueId: z.uuidv4(),
  author: CommentAuthorSchema,
  text: z.string(),
  createdAt: z.iso.datetime(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const ParamsSchema = z.object({
  id: z.uuidv4().openapi({
    param: { name: "id", in: "path" },
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
});

const route = createRoute({
  method: "post",
  path: "/issues/{id}/comments",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: CreateCommentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CommentSchema,
        },
      },
      description: "Comment created successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Unauthorized",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Issue not found",
    },
  },
});

const app = new OpenAPIHono<{
  Variables: {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
  };
}>();

app.use(requireAuth);

export const createComment = app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const user = c.get("user");

  // Check if issue exists
  const [issue] = await db.select().from(issues).where(eq(issues.id, id));

  if (!issue) {
    return c.json(
      {
        error: "Issue not found",
        message: `Issue with id ${id} does not exist`,
      },
      404,
    );
  }

  const [comment] = await db
    .insert(comments)
    .values({
      issueId: id,
      authorName: user!.name,
      authorAvatar: user!.image || "",
      text: body.text,
    })
    .returning();

  return c.json(
    {
      id: comment.id,
      issueId: comment.issueId,
      author: {
        name: comment.authorName,
        avatar: comment.authorAvatar,
      },
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    },
    201,
  );
});
