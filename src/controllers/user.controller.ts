import { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import AppError from '../utils/AppError';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  // Restrict own profile updates to safe name parameters
  const result = await UserService.updateUser(userId, { name: req.body.name });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const adminUpdateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User status/role updated successfully by Admin',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  const currentUserRole = req.user?.role;

  // Authorization check: Only ADMIN or the profile owner can delete
  if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
    throw new AppError(403, 'Forbidden! You can only delete your own profile');
  }

  await UserService.deleteUser(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User account deleted successfully',
    data: null,
  });
});

export const UserController = {
  getAllUsers,
  getMyProfile,
  getUserById,
  updateMyProfile,
  adminUpdateUser,
  deleteUser,
};
