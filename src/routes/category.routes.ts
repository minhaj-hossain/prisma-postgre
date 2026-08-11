import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { CategoryValidation } from '../services/category/category.validation';
import auth from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Retrieve all categories (Public)
router.get('/', CategoryController.getAllCategories);

// Retrieve category by ID (Public)
router.get('/:id', CategoryController.getCategoryById);

// Create Category (Admin Only)
router.post(
  '/',
  auth('ADMIN'),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

// Update Category (Admin Only)
router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

// Delete Category (Admin Only - Soft Delete)
router.delete('/:id', auth('ADMIN'), CategoryController.deleteCategory);

export const CategoryRoutes = router;
