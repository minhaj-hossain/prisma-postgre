import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';

/**
 * Handle user registration requests
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Handle user login requests
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken, user } = result;

  // Set the refresh token inside a secure HttpOnly cookie for enhanced security
  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: {
      accessToken,
      user,
    },
  });
});

export const AuthController = {
  register,
  login,
};
