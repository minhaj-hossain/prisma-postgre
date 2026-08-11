import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthValidation } from '../services/auth/auth.validation';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Registration Endpoint
router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register
);

// Login Endpoint
router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);

export const AuthRoutes = router;
