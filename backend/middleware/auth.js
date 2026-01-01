import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ErrorHandler } from '../utils/errorHandler.js';
dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.accessToken;
  // console.log('access token - ', token);

  if (!token) {
    throw new ErrorHandler(400, 'Token not found, Please login first');
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log('decoded : ', decoded);

    req.user = decoded;
    return next();
  } catch (error) {
    console.log('auth error - ', error);
    throw new ErrorHandler(500, 'Something went wrong');
  }
};

export const isAdmin = async (req, res, next) => {
  const user = req.user;

  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access forbidden',
    });
  }

  return next();
};
