import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const SignUpSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  name: z
    .string()
    .min(2, { message: "Name is required" }),
});

export type SignInIndex = z.infer<typeof SignInSchema>;
export type SignUpIndex = z.infer<typeof SignUpSchema>;