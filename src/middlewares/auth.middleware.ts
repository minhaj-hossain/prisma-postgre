import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

// Extend the Express Request type interface to store decoded token payloads
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string; email: string; role: string };
    }
  }
}

const auth = (...requiredRoles: ('ADMIN' | 'CUSTOMER')[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'You are not authorized! Token is missing');
    }

    const token = authorizationHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      const secret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_123';
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new AppError(401, 'Unauthorized! Access token is invalid or expired');
    }

    const { id, role } = decoded;

    // Check if the user exists in database
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError(404, 'User account associated with this token was not found');
    }

    // Verify account status
    if (user.isDeleted) {
      throw new AppError(403, 'Unauthorized! User account has been deleted');
    }

    if (user.status === 'BLOCKED') {
      throw new AppError(403, 'Unauthorized! User account has been blocked');
    }

    // Perform role authorizations
    if (requiredRoles.length && !requiredRoles.includes(role as 'ADMIN' | 'CUSTOMER')) {
      throw new AppError(403, 'Forbidden! You do not have permission to access this resource');
    }

    // Bind decoded info to the request context
    req.user = decoded as JwtPayload & { id: string; email: string; role: string };
    next();
  });
};

export default auth;
