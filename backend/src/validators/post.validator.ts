import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string({ required_error: "Post title is required" })
    .trim()
    .min(5, "Title must be at least 5 characters long")
    .max(200, "Title cannot exceed 200 characters"),
  body: z
    .string({ required_error: "Post content is required" })
    .trim()
    .min(10, "Post content must be at least 10 characters long"),
  tags: z
    .array(z.string().trim().min(1))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

export const getPostsQuerySchema = z.object({
  sort: z.enum(["ranked", "latest"]).optional().default("ranked"),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetPostsQueryInput = z.infer<typeof getPostsQuerySchema>;
