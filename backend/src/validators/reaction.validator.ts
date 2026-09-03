import { z } from "zod";

export const reactionSchema = z.object({
  reactionType: z.enum(["like", "dislike"], {
    required_error: "Reaction type must be either 'like' or 'dislike'",
  }),
});

export type ReactionInput = z.infer<typeof reactionSchema>;
