import { z } from 'zod';
import {
  createInsertSchema,
  createSelectSchema,
} from 'drizzle-zod';
import { users } from '../db/schema';

export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);
export const UserSignUpSchema = UserInsertSchema
  .omit({ id: true, hashedPassword: true })
  .extend({
    name: z
      .string()
      .min(1, "Name is required.")
      .max(30, "Name must be at most 30 characters long."),
    email: z
      .string()
      .email("Email is invalid.")
      .min(1, "Email is required."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
  });
export const UserLoginSchema = UserSignUpSchema.omit({ name: true });

export type UserDB = z.infer<typeof UserSelectSchema>;
export type UserSignUp = z.infer<typeof UserSignUpSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export interface UserPublic extends Omit<UserDB, 'hashedPassword'> { }