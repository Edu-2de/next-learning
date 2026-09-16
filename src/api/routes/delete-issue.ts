import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { issues } from "../db/schema";

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
  method: "delete",
  path: "/issues/{id}",
  request: {
    params: ParamsSchema,
  },
  responses: {
    204: {
      description: "Issue deleted successfully",
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

export const deleteIssue = new OpenAPIHono().openapi(route, async (c) => {
  const { id } = c.req.valid("param");

  const result = await db.delete(issues).where(eq(issues.id, id)).returning();

  if (result.length === 0) {
    return c.json(
      {
        error: "Issue not found",
        message: `Issue with id ${id} does not exist`,
      },
      404,
    );
  }

  return c.body(null, 204);
});
