import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import globalErrorHandler from './middlewares/error.middleware';
import router from './routes';

const app: Application = express();

// Global Parser Middlewares
app.use(cors({
  origin: '*', // Customize this for specific frontend domains in production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Application Route Handler
app.use('/api', router);

// Root Check Endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the SCIC/EJP-13 E-Commerce API',
  });
});

// Fallback Route Handler (404 Not Found)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    errorSources: [
      {
        path: req.originalUrl,
        message: 'The requested path does not exist on this server',
      },
    ],
  });
});

// Global Error Interceptor Middleware
app.use(globalErrorHandler);

export default app;
