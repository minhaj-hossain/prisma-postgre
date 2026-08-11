import { Router } from 'express';
import { AuthRoutes } from './auth.routes';
import { CategoryRoutes } from './category.routes';
import { ProductRoutes } from './product.routes';
import { UserRoutes } from './user.routes';
import { ReviewRoutes } from './review.routes';
import { OrderRoutes } from './order.routes';

const router = Router();

// Module API Namespace Mappings
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
];

// Register each route module in Express router
moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Base health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running healthy',
  });
});

export default router;
