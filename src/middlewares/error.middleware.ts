import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export type TErrorSource = {
  path: string | number;
  message: string;
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong!';
  let errorSources: TErrorSource[] = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1] || '',
      message: issue.message,
    }));
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Catch common Prisma Unique Constraint and other database errors
    statusCode = 400;
    message = 'Database query validation failed';
    errorSources = [
      {
        path: Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target as string) || '',
        message: `Value must be unique. Database code: ${err.code}`,
      },
    ];
  } else if (err instanceof Error) {
    errorSources = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  // Ensure express responds with the proper status code and structured JSON
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
};

export default globalErrorHandler;
