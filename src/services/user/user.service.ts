import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';

const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || user.isDeleted) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

const updateUser = async (id: string, payload: any) => {
  // Check if user exists
  await getUserById(id);

  return await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteUser = async (id: string) => {
  await getUserById(id);

  // Soft delete user
  return await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
