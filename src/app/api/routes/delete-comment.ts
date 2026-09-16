import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import type { AuthSession } from "../auth";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { requireAuth } from "../middlewares/auth";

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const ParamsSchema = z.object({
  issueId: z.uuidv4().openapi({
    param: { name: "issueId", in: "path" },
    example: "550e8400-e29b-41d4-a716-446655440000",
  }),
  commentId: z.uuidv4().openapi({
    param: { name: "commentId", in: "path" },
    example: "550e8400-e29b-41d4-a716-446655440001",
  }),
});

const route = createRoute({
  method: "delete",
  path: "/issues/{issueId}/comments/{commentId}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    204: {
      description: "Comment deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Forbidden - You can only delete your own comments",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Comment not found",
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

export const deleteComment = app.openapi(route, async (c) => {
  const { commentId } = c.req.valid("param");
  const user = c.get("user");

  // Check if comment exists
  const [existingComment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!existingComment) {
    return c.json(
      {
        error: "Comment not found",
        message: `Comment with id ${commentId} does not exist`,
      },
      404,
    );
  }

  // Check if user is the author
  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.email, user!.email));

  if (existingComment.authorName !== author.name) {
    return c.json(
      {
        error: "Unauthorized",
        message: "You can only delete your own comments",
      },
      403,
    );
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  return c.body(null, 204);
});
