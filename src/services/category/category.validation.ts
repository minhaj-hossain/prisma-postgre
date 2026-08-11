import { z } from 'zod';

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Category name is required',
    }).trim().min(1, { message: 'Category name cannot be empty' }),
    slug: z.string({
      required_error: 'Slug is required',
    }).trim().min(1, { message: 'Slug cannot be empty' }),
    description: z.string().optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
