import { z } from 'zod';

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  }),
});

const updateUserStatusRoleValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
    status: z.enum(['ACTIVE', 'BLOCKED']).optional(),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
  updateUserStatusRoleValidationSchema,
};
