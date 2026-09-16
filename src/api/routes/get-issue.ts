import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { comments, issues } from "../db/schema";

export const IssueStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "done",
]);

export const IssueSchema = z.object({
  id: z.uuidv4(),
  issueNumber: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: IssueStatusSchema,
  comments: z.number().int(),
  createdAt: z.string().datetime(),
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
  method: "get",
  path: "/issues/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue details",
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

export const getIssue = new OpenAPIHono().openapi(route, async (c) => {
  const { id } = c.req.valid("param");

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

  const commentCount = await db.$count(comments, eq(comments.issueId, id));

  return c.json(
    {
      id: issue.id,
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      comments: commentCount,
      createdAt: issue.createdAt.toISOString(),
    },
    200,
  );
});
