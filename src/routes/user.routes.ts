import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserValidation } from '../services/user/user.validation';
import auth from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Retrieve own profile (Authenticated)
router.get('/me', auth('ADMIN', 'CUSTOMER'), UserController.getMyProfile);

// Update own profile (Authenticated)
router.patch(
  '/me',
  auth('ADMIN', 'CUSTOMER'),
  validateRequest(UserValidation.updateProfileValidationSchema),
  UserController.updateMyProfile
);

// Retrieve all users (Admin Only)
router.get('/', auth('ADMIN'), UserController.getAllUsers);

// Retrieve single user by ID (Admin Only)
router.get('/:id', auth('ADMIN'), UserController.getUserById);

// Update user role or status (Admin Only)
router.patch(
  '/:id',
  auth('ADMIN'),
  validateRequest(UserValidation.updateUserStatusRoleValidationSchema),
  UserController.adminUpdateUser
);

// Delete profile (Authenticated User or Admin Only)
router.delete('/:id', auth('ADMIN', 'CUSTOMER'), UserController.deleteUser);

export const UserRoutes = router;
