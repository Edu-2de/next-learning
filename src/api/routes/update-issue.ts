import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { comments, issues } from "../db/schema";

const IssueStatusSchema = z.enum(["backlog", "todo", "in_progress", "done"]);

const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: IssueStatusSchema.optional(),
});

const IssueSchema = z.object({
  id: z.uuidv4(),
  issueNumber: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: IssueStatusSchema,
  likes: z.number().int(),
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
  method: "patch",
  path: "/issues/{id}",
  request: {
    params: ParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateIssueSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue updated successfully",
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

export const updateIssue = new OpenAPIHono().openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const [issue] = await db
    .update(issues)
    .set(body)
    .where(eq(issues.id, id))
    .returning();

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
      likes: issue.likes,
      comments: commentCount,
      createdAt: issue.createdAt.toISOString(),
    },
    200,
  );
});
