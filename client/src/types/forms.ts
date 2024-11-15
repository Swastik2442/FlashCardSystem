import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
});
export type TLoginFormSchema = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  fullName: z.string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(64, { message: "Name cannot be more than 64 characters." }),
  email: z.string().email("Invalid email address."),
  username: z.string().toLowerCase()
    .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores." })
    .min(2, { message: "Username must be at least 2 characters." })
    .max(32, { message: "Username cannot be more than 32 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
});
export type TRegisterFormSchema = z.infer<typeof registerFormSchema>;

export const userDetailsFormSchema = z.object({
  fullName: z.string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(64, { message: "Name cannot be more than 64 characters." }),
});
export type TUserDetailsFormSchema = z.infer<typeof userDetailsFormSchema>;

export const changeUsernameFormSchema = z.object({
  username: z.string().toLowerCase()
    .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores." })
    .min(2, { message: "Username must be at least 2 characters." })
    .max(32, { message: "Username cannot be more than 32 characters." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
});
export type TChangeUsernameFormSchema = z.infer<typeof changeUsernameFormSchema>;

export const changeEmailFormSchema = loginFormSchema;
export type TChangeEmailFormSchema = z.infer<typeof changeEmailFormSchema>;

export const changePasswordFormSchema = z.object({
  oldPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password cannot be more than 128 characters." }),
});
export type TChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>;

export const deckFormSchema = z.object({
  name: z.string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(64, { message: "Name must be at most 64 characters." }),
  description: z.string()
    .max(256, { message: "Description must be at most 256 characters." }),
  isPrivate: z.boolean().default(true).optional(),
});
export type TDeckFormSchema = z.infer<typeof deckFormSchema>;

export const cardFormSchema = z.object({
  question: z.string()
    .min(3, { message: "Question must be at least 3 characters." })
    .max(128, { message: "Question must be at most 128 characters." }),
  answer: z.string()
    .min(3, { message: "Answer must be at least 3 characters." })
    .max(128, { message: "Answer must be at most 128 characters." }),
  hint: z.string()
    .max(64, { message: "Hint must be at most 64 characters." }),
  deck: z.string().optional(),
});
export type TCardFormSchema = z.infer<typeof cardFormSchema>;

export const deckShareFormSchema = z.object({
  user: z.string().min(1, { message: "User cannot be empty." }),
  isEditable: z.boolean().default(false).optional(),
  unshare: z.boolean().default(false).optional(),
});
export type TDeckShareFormSchema = z.infer<typeof deckShareFormSchema>;

export const deckOwnerFormSchema = z.object({
  user: z.string().min(1, { message: "User cannot be empty." }),
});
export type TDeckOwnerFormSchema = z.infer<typeof deckOwnerFormSchema>;
