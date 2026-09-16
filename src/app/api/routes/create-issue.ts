import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../db";
import { issues } from "../db/schema";

const IssueStatusSchema = z.enum(["backlog", "todo", "in_progress", "done"]);

const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: IssueStatusSchema.optional().default("backlog"),
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

const route = createRoute({
  method: "post",
  path: "/issues",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateIssueSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: IssueSchema,
        },
      },
      description: "Issue created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Validation failed",
    },
  },
});

export const createIssue = new OpenAPIHono().openapi(route, async (c) => {
  const body = c.req.valid("json");

  const [issue] = await db
    .insert(issues)
    .values({
      title: body.title,
      description: body.description,
      status: body.status,
    })
    .returning();

  return c.json(
    {
      id: issue.id,
      issueNumber: issue.issueNumber,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      likes: issue.likes,
      comments: 0,
      createdAt: issue.createdAt.toISOString(),
    },
    201,
  );
});
