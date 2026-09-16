import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { and, eq, inArray } from "drizzle-orm";
import type { AuthSession } from "../auth";
import { db } from "../db";
import { issueLikes, issues } from "../db/schema";
import { IssueInteractionsResponseSchema } from "./schemas/issue-interactions";

const route = createRoute({
  method: "get",
  path: "/issues/interactions",
  request: {
    query: z.object({
      issueIds: z
        .string()
        .describe("Comma-separated list of issue IDs")
        .openapi({
          example:
            "550e8400-e29b-41d4-a716-446655440000,660e8400-e29b-41d4-a716-446655440001",
        }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IssueInteractionsResponseSchema,
        },
      },
      description: "User interactions with issues (likes)",
    },
  },
});

export const getIssueInteractions = new OpenAPIHono<{
  Variables: {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
  };
}>().openapi(route, async (c) => {
  const { issueIds } = c.req.valid("query");
  const user = c.get("user");

  const issueIdArray = issueIds.split(",").filter(Boolean);

  if (issueIdArray.length === 0) {
    return c.json({ interactions: [] }, 200);
  }

  // Get likes count for each issue
  const issuesData = await db
    .select({
      id: issues.id,
      likes: issues.likes,
    })
    .from(issues)
    .where(inArray(issues.id, issueIdArray));

  // If user is authenticated, get their likes
  let userLikes: string[] = [];
  if (user) {
    const likes = await db
      .select({ issueId: issueLikes.issueId })
      .from(issueLikes)
      .where(
        and(
          eq(issueLikes.userId, user.id),
          inArray(issueLikes.issueId, issueIdArray),
        ),
      );

    userLikes = likes.map((like) => like.issueId);
  }

  const interactions = issuesData.map((issue) => ({
    issueId: issue.id,
    isLiked: userLikes.includes(issue.id),
    likesCount: issue.likes,
  }));

  return c.json({ interactions }, 200);
});
