import { z } from "zod";

export const IssueInteractionSchema = z.object({
  issueId: z.string().uuid(),
  isLiked: z.boolean(),
  likesCount: z.number().int(),
});

export const IssueInteractionsResponseSchema = z.object({
  interactions: z.array(IssueInteractionSchema),
});
