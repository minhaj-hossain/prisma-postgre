import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';

const createReview = async (userId: string, payload: any) => {
  const { productId, rating, comment } = payload;

  // Check if product exists
  const productExists = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!productExists || productExists.isDeleted) {
    throw new AppError(404, 'Product not found or has been deleted');
  }

  return await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const getReviewsByProduct = async (productId: string) => {
  return await prisma.review.findMany({
    where: {
      productId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review || review.isDeleted) {
    throw new AppError(404, 'Review not found');
  }

  return review;
};

const updateReview = async (id: string, userId: string, payload: any) => {
  const review = await getReviewById(id);

  // Authorization check: Only the author of the review can edit it
  if (review.userId !== userId) {
    throw new AppError(403, 'You do not have permission to edit this review');
  }

  return await prisma.review.update({
    where: { id },
    data: payload,
  });
};

const deleteReview = async (id: string, userId: string, userRole: string) => {
  const review = await getReviewById(id);

  // Authorization check: Only the author or an ADMIN can delete the review
  if (review.userId !== userId && userRole !== 'ADMIN') {
    throw new AppError(403, 'You do not have permission to delete this review');
  }

  return await prisma.review.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const ReviewService = {
  createReview,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteReview,
};
