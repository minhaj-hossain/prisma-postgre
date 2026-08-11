import { z } from 'zod';

const createOrderValidationSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string({
            required_error: 'Product ID is required',
          }).uuid('Invalid product ID format'),
          quantity: z
            .number({
              required_error: 'Quantity is required',
            })
            .int()
            .positive('Quantity must be at least 1'),
        })
      )
      .nonempty('Order must contain at least one product item'),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
      required_error: 'Order status is required',
    }),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
};
