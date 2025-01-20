import { z } from "zod";

let requiredString = z.string().trim().min(1, "Required");
export const signUpSchema = z.object({
  email: requiredString.email("Invalid email address"),
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, - and _ allowed",
  ),
  // TODO: should be a regex for more security
  password: requiredString.min(8, "Password must be at least 8 characters"),
});

export type SingUpValues = z.infer<typeof signUpSchema>;

export const logInSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LogInValues = z.infer<typeof logInSchema>;

export const postSchema = z.object({
  content: requiredString,
});

export type PostValue = z.infer<typeof postSchema>;
