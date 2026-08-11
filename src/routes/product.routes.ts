import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductValidation } from '../services/product/product.validation';
import auth from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Retrieve all products (Public - Supports search, filters, pagination)
router.get('/', ProductController.getAllProducts);

// Retrieve product by ID (Public)
router.get('/:id', ProductController.getProductById);

// Create Product (Admin Only)
router.post(
  '/',
  auth('ADMIN'),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductController.createProduct
);

// Update Product (Admin Only)
router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductController.updateProduct
);

// Delete Product (Admin Only - Soft Delete)
router.delete('/:id', auth('ADMIN'), ProductController.deleteProduct);

export const ProductRoutes = router;
