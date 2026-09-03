import { z } from "zod";

export const experienceSchema = z.object({
  _id: z.string().optional(),
  title: z
    .string({ required_error: "Job title is required" })
    .trim()
    .min(1, "Job title cannot be empty")
    .max(100, "Job title cannot exceed 100 characters"),
  company: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(1, "Company name cannot be empty")
    .max(100, "Company name cannot exceed 100 characters"),
  from: z
    .string({ required_error: "Start date is required" })
    .trim()
    .min(1, "Start date cannot be empty"),
  to: z.string().trim().optional(),
  currentlyWorking: z.boolean().default(false),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(60, "Name cannot exceed 60 characters")
    .optional(),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  avatarUrl: z.string().url("Invalid avatar URL format").or(z.literal("")).optional(),
  skills: z.array(z.string().trim().min(1)).max(30, "Maximum 30 skills allowed").optional(),
  experiences: z.array(experienceSchema).max(20, "Maximum 20 experience entries allowed").optional(),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
