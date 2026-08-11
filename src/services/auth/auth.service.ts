import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';
import { createToken } from './auth.utils';

/**
 * Handle user registration business logic
 */
const registerUser = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  // Hash password using BCRYPT
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  // Save the new user record to the database
  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || 'CUSTOMER',
    },
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

  return result;
};

/**
 * Handle user login business logic
 */
const loginUser = async (payload: any) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(404, 'No user found with this email');
  }

  if (user.isDeleted) {
    throw new AppError(400, 'This user account has been deleted');
  }

  if (user.status === 'BLOCKED') {
    throw new AppError(403, 'This user account has been blocked');
  }

  // Verify the plain text password matches the hashed version in the database
  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(401, 'Invalid password');
  }

  // Create token payload
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'fallback_secret_123';
  const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback_secret_456';
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  // Generate tokens
  const accessToken = createToken(jwtPayload, accessTokenSecret, accessTokenExpiresIn);
  const refreshToken = createToken(jwtPayload, refreshTokenSecret, refreshTokenExpiresIn);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
