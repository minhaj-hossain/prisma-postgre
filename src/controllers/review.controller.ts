import { Request, Response } from 'express';
import { ReviewService } from '../services/review/review.service';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewsByProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const result = await ReviewService.getReviewsByProduct(productId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const result = await ReviewService.updateReview(id, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  await ReviewService.deleteReview(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
};
