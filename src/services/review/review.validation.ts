import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    rating: z.number({
      required_error: 'Rating value is required',
    }).int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string({
      required_error: 'Review comment is required',
    }).trim().min(1, 'Comment cannot be empty'),
    productId: z.string({
      required_error: 'Product ID is required',
    }).uuid('Invalid product ID format'),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(1).optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
