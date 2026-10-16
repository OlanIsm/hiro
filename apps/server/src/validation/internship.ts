import { z } from "zod";
import { INTERNSHIP_STATUSES } from "../constants/status.js";

export const CreateInternshipSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "companyName cannot be empty"),
  role: z
    .string()
    .trim()
    .min(1, "role cannot be empty"),
  jobDescription: z.string().trim().nullable().optional(),
  skills: z.array(z.string().trim()).optional().default([]),
  status: z.enum(INTERNSHIP_STATUSES).optional().default("APPLIED"),
  appliedAt: z.coerce.date().optional(),
  jobUrl: z
    .string()
    .trim()
    .url("jobUrl must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  recruiterEmail: z
    .string()
    .trim()
    .email("recruiterEmail must be a valid email")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  notes: z.string().trim().nullable().optional(),
  nextAction: z.string().trim().nullable().optional(),
  deadline: z.coerce
    .date()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export const UpdateInternshipSchema = z
  .object({
    companyName: z.string().trim().min(1, "companyName cannot be empty").optional(),
    role: z.string().trim().min(1, "role cannot be empty").optional(),
    jobDescription: z.string().trim().nullable().optional(),
    skills: z.array(z.string().trim()).optional(),
    status: z.enum(INTERNSHIP_STATUSES).optional(),
    appliedAt: z.coerce.date().optional(),
    jobUrl: z
      .string()
      .trim()
      .url("jobUrl must be a valid URL")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    recruiterEmail: z
      .string()
      .trim()
      .email("recruiterEmail must be a valid email")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    notes: z.string().trim().nullable().optional(),
    nextAction: z.string().trim().nullable().optional(),
    deadline: z.coerce
      .date()
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
  })
  .strict();

export const InternshipIdParamSchema = z.object({
  id: z.string().uuid("Invalid internship ID format (must be a valid UUID)"),
});

export const ImportInternshipsSchema = z.object({
  items: z.array(CreateInternshipSchema).min(1, "At least one internship is required to import"),
});

export type CreateInternshipInput = z.infer<typeof CreateInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof UpdateInternshipSchema>;
export type ImportInternshipsInput = z.infer<typeof ImportInternshipsSchema>;
