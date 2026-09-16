import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq, sql } from "drizzle-orm";
import type { AuthSession } from "../auth";
import { db } from "../db";
import { issueLikes, issues } from "../db/schema";
import { requireAuth } from "../middlewares/auth";

const LikeResponseSchema = z.object({
  id: z.uuidv4(),
  likes: z.number().int(),
  liked: z.boolean(),
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
  path: "/issues/{id}/like",
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LikeResponseSchema,
        },
      },
      description: "Like toggled successfully",
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

export const toggleIssueLike = app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
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

  // Check if user already liked this issue
  const [existingLike] = await db
    .select()
    .from(issueLikes)
    .where(and(eq(issueLikes.issueId, id), eq(issueLikes.userId, user!.id)));

  let liked = false;

  if (existingLike) {
    // Unlike: remove the like
    await db
      .delete(issueLikes)
      .where(and(eq(issueLikes.issueId, id), eq(issueLikes.userId, user!.id)));

    await db
      .update(issues)
      .set({ likes: sql`${issues.likes} - 1` })
      .where(eq(issues.id, id));

    liked = false;
  } else {
    // Like: add the like
    await db.insert(issueLikes).values({
      issueId: id,
      userId: user!.id,
    });

    await db
      .update(issues)
      .set({ likes: sql`${issues.likes} + 1` })
      .where(eq(issues.id, id));

    liked = true;
  }

  // Get updated issue
  const [updatedIssue] = await db
    .select()
    .from(issues)
    .where(eq(issues.id, id));

  return c.json(
    {
      id: updatedIssue.id,
      likes: updatedIssue.likes,
      liked,
    },
    200,
  );
});
