import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderValidation } from '../services/order/order.validation';
import auth from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validate.middleware';

const router = Router();

// Retrieve own order history (Authenticated)
router.get('/my-orders', auth('ADMIN', 'CUSTOMER'), OrderController.getMyOrders);

// Retrieve single order details by ID (Authenticated - owner/admin checks enforced in service)
router.get('/:id', auth('ADMIN', 'CUSTOMER'), OrderController.getOrderById);

// Place an order (Authenticated)
router.post(
  '/',
  auth('ADMIN', 'CUSTOMER'),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrder
);

// Retrieve all customer orders (Admin Only)
router.get('/', auth('ADMIN'), OrderController.getAllOrders);

// Update order status (Admin Only)
router.patch(
  '/:id/status',
  auth('ADMIN'),
  validateRequest(OrderValidation.updateOrderStatusValidationSchema),
  OrderController.updateOrderStatus
);

// Delete order (Admin Only - Soft Delete)
router.delete('/:id', auth('ADMIN'), OrderController.deleteOrder);

export const OrderRoutes = router;
