import { z } from 'zod';

export const EmailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const SignInPasswordSchema = z.string().min(1, 'Password is required');

export const CreatePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password must be 72 characters or less');

export const CreateDriftSchema = z.object({
  text: z
    .string()
    .min(20, 'Decision must be at least 20 characters')
    .max(200, 'Decision must be 200 characters or less'),
  stake: z.string().min(10, 'Stake must be at least 10 characters').max(100, 'Stake must be 100 characters or less'),
  context: z.string().max(300).optional(),
  category: z.enum(['life', 'career', 'love', 'money', 'health', 'random']),
  isAnonymous: z.boolean(),
});

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be 20 characters or less')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

export const LoginSchema = z.object({
  email: EmailSchema,
  password: SignInPasswordSchema,
});

export const RegisterSchema = z
  .object({
    username: UsernameSchema,
    email: EmailSchema,
    password: CreatePasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const CommentSchema = z.string().min(1, 'Comment cannot be empty').max(280, 'Comment must be 280 characters or less');

export const BioSchema = z.string().max(120, 'Bio must be 120 characters or less');
