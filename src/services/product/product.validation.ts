import { z } from 'zod';

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    }).trim().min(1, { message: 'Product name cannot be empty' }),
    description: z.string({
      required_error: 'Product description is required',
    }).trim().min(1, { message: 'Product description cannot be empty' }),
    price: z.number({
      required_error: 'Product price is required',
    }).positive({ message: 'Price must be a positive number' }),
    stock: z.number({
      required_error: 'Stock level is required',
    }).int({ message: 'Stock must be an integer' }).nonnegative({ message: 'Stock cannot be negative' }),
    categoryId: z.string({
      required_error: 'Category ID is required',
    }).uuid({ message: 'Invalid category ID' }),
    status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK']).optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().positive({ message: 'Price must be a positive number' }).optional(),
    stock: z.number().int().nonnegative({ message: 'Stock cannot be negative' }).optional(),
    categoryId: z.string().uuid({ message: 'Invalid category ID' }).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK']).optional(),
  }),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
