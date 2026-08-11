import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Sign a JWT token using payload, secret and expiration arguments
 */
export const createToken = (
  jwtPayload: { id: string; email: string; role: string },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  });
};
