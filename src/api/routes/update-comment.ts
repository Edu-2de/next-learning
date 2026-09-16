import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import type { AuthSession } from "../auth";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { requireAuth } from "../middlewares/auth";

const UpdateCommentSchema = z.object({
  text: z.string().min(1),
});

const CommentAuthorSchema = z.object({
  name: z.string(),
  avatar: z.url(),
});

const CommentSchema = z.object({
  id: z.uuidv4(),
  issueId: z.uuidv4(),
  author: CommentAuthorSchema,
  text: z.string(),
  createdAt: z.string().datetime(),
});

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
  method: "patch",
  path: "/issues/{issueId}/comments/{commentId}",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateCommentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CommentSchema,
        },
      },
      description: "Comment updated successfully",
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
      description: "Forbidden - You can only edit your own comments",
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

export const updateComment = app.openapi(route, async (c) => {
  const { commentId } = c.req.valid("param");
  const body = c.req.valid("json");
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
        message: "You can only edit your own comments",
      },
      403,
    );
  }

  const [comment] = await db
    .update(comments)
    .set({ text: body.text })
    .where(eq(comments.id, commentId))
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
    200,
  );
});
