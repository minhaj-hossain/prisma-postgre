import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { ReviewValidation } from '../services/review/review.validation';
import auth from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Retrieve reviews for a specific product (Public)
router.get('/product/:productId', ReviewController.getReviewsByProduct);

// Create Review (Authenticated Users)
router.post(
  '/',
  auth('ADMIN', 'CUSTOMER'),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

// Update Review (Author Only)
router.patch(
  '/:id',
  auth('ADMIN', 'CUSTOMER'),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview
);

// Delete Review (Author or Admin - Soft Delete)
router.delete('/:id', auth('ADMIN', 'CUSTOMER'), ReviewController.deleteReview);

export const ReviewRoutes = router;
