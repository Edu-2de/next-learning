import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { comments, issues } from "../db/schema";

export const CommentAuthorSchema = z.object({
  name: z.string(),
  avatar: z.url(),
});

export const CommentSchema = z.object({
  id: z.uuidv4(),
  issueId: z.uuidv4(),
  author: CommentAuthorSchema,
  text: z.string(),
  createdAt: z.string().datetime(),
});

export const CommentsListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
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

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const route = createRoute({
  method: "get",
  path: "/issues/{id}/comments",
  request: {
    params: ParamsSchema,
    query: QuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CommentsListResponseSchema,
        },
      },
      description: "List of comments for the issue",
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

export const listIssueComments = new OpenAPIHono().openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  const { limit, offset } = c.req.valid("query");

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

  const issueComments = await db
    .select()
    .from(comments)
    .where(eq(comments.issueId, id))
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db.$count(comments, eq(comments.issueId, id));

  return c.json(
    {
      comments: issueComments.map((comment) => ({
        id: comment.id,
        issueId: comment.issueId,
        author: {
          name: comment.authorName,
          avatar: comment.authorAvatar,
        },
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
      })),
      total,
      limit,
      offset,
    },
    200,
  );
});
