import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).trim().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string({
      required_error: 'Email is required',
    }).trim().email({ message: 'Invalid email address' }),
    password: z.string({
      required_error: 'Password is required',
    }).min(6, { message: 'Password must be at least 6 characters' }),
    role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).trim().email({ message: 'Invalid email address' }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
