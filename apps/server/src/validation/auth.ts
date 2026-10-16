import { z } from "zod";

export const SetupPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export const LoginSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required"),
});

export type SetupPasswordInput = z.infer<typeof SetupPasswordSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
